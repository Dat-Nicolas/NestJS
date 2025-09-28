import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';

type ProductDoc = {
  id: string;
  name: string;
  slug: string;
  price: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  suggest?: string[];
};

@Injectable()
export class SearchService {
  private index: string;

  constructor(
    private readonly cfg: ConfigService,
    private readonly es: ElasticsearchService,
  ) {
    this.index = this.cfg.get<string>('ELASTIC_INDEX', 'products');
  }

  async indexOne(doc: ProductDoc) {
    return this.es.index({
      index: this.index,
      id: doc.id,
      document: {
        ...doc,
        suggest: doc.suggest ?? [doc.name],
        createdAt: doc.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      refresh: 'wait_for',
    });
  }

  async bulkIndex(docs: ProductDoc[]) {
    if (!docs.length) return { items: [] };
    const ops = docs.flatMap((d) => [
      { index: { _index: this.index, _id: d.id } },
      {
        ...d,
        suggest: d.suggest ?? [d.name],
        createdAt: d.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    return this.es.bulk({ operations: ops, refresh: 'wait_for' });
  }

  async updatePartial(id: string, patch: Partial<ProductDoc>) {
    return this.es.update({
      index: this.index,
      id,
      doc: { ...patch, updatedAt: new Date().toISOString() },
      refresh: 'wait_for',
    });
  }

  async delete(id: string) {
    return this.es.delete({ index: this.index, id, refresh: 'wait_for' });
  }

  async search(
    q: string,
    opts?: {
      page?: number;
      size?: number;
      tags?: string[];
      minPrice?: number;
      maxPrice?: number;
    },
  ) {
    const page = Math.max(1, opts?.page ?? 1);
    const size = Math.min(100, Math.max(1, opts?.size ?? 10));
    const from = (page - 1) * size;

    const must: any[] = [];
    const filter: any[] = [];

    if (q) {
      must.push({
        multi_match: {
          query: q,
          fields: ['name^3', 'slug^2', 'tags'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    if (opts?.tags?.length) {
      filter.push({ terms: { tags: opts.tags } });
    }
    if (opts?.minPrice != null || opts?.maxPrice != null) {
      filter.push({
        range: { price: { gte: opts?.minPrice, lte: opts?.maxPrice } },
      });
    }
    const sort: any[] = [];
    if (q) sort.push({ _score: { order: 'desc' } }); // chỉ thêm khi có truy vấn full-text
    sort.push({ createdAt: { order: 'desc' } });

    const res = await this.es.search<ProductDoc>({
      index: this.index,
      from,
      size,
      query: {
        bool: { must: must.length ? must : [{ match_all: {} }], filter },
      },
      sort,
    });

    return {
      total: (res.hits.total as any)?.value ?? 0,
      items: res.hits.hits.map((h) => ({
        id: h._id,
        score: h._score,
        ...h._source!,
      })),
    };
  }

  async suggest(prefix: string, size = 5) {
    const res = await this.es.search({
      index: this.index,
      suggest: {
        product_suggest: {
          prefix,
          completion: { field: 'suggest', size },
        },
      },
    });
    const suggestions =
      (res.suggest as any).product_suggest?.[0]?.options ?? [];
    return suggestions.map((s: any) => s.text);
  }
}
