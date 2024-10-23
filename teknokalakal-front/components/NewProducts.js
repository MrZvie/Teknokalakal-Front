import Center from "./Center";
import ProductBox from "./ProductBox";

export default function NewProducts({ products }) {
  return (
    <Center style={{ padding: "0px" }}>     
    <div className="grid grid-cols-4 gap-7 pt-[20px]">
      {products?.length > 0 &&  products.map(product => (
        <ProductBox key={product._id} {...product} />
      ))}
    </div>
    </Center>
  );
}