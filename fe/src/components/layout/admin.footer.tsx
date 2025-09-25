'use client'
import { Layout } from 'antd';

const AdminFooter = () => {
    const { Footer } = Layout;

    return (
        <>
            <Footer style={{ textAlign: 'center' }}>
                Topchit ©{new Date().getFullYear()} Created by Topchit
            </Footer>
        </>
    )
}

export default AdminFooter;