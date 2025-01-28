import Center from "@/components/Center";
import Layout from "@/components/Layout";
import ProductForm from "@/components/ProductForm";

export default function NewProduct() {
  return (
    <Layout>
      <Center>
        <h1>New Product</h1>
        <ProductForm/>
      </Center>
    </Layout>
  );
}
