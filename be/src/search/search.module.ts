// search/search.module.ts
import { Module, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        node: cfg.get<string>('ELASTIC_NODE'),
        // auth / tls cho PROD:
        // auth: { username: cfg.get('ELASTIC_USERNAME'), password: cfg.get('ELASTIC_PASSWORD') },
        // tls: { ca: fs.readFileSync('http_ca.crt'), rejectUnauthorized: true },
        // maxRetries: 5, requestTimeout: 30000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule implements OnModuleInit {
  constructor(
    private readonly cfg: ConfigService,
    @Inject(ElasticsearchService) private readonly es: ElasticsearchService,
  ) {}

  async onModuleInit() {
    const index = this.cfg.get<string>('ELASTIC_INDEX')!;
    const exists = await this.es.indices.exists({ index });
    if (!exists) {
      await this.es.indices.create({
        index,
        settings: {
          analysis: {
            analyzer: {
              // Analyzer đơn giản; có thể nâng cấp bằng ICU/vi-tokenizer khi cần
              vi_text: { type: 'standard', stopwords: '_none_' },
            },
          },
        },
        mappings: {
          properties: {
            id:      { type: 'keyword' },
            name:    { type: 'text', analyzer: 'vi_text' },
            slug:    { type: 'keyword' },
            price:   { type: 'double' },
            tags:    { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            // gợi ý autocomplete (optional)
            suggest: { type: 'completion' },
          },
        },
      });
    }
  }
}
