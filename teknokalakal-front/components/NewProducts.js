import Center from "./Center";
import ProductBox from "./ProductBox";

export default function NewProducts({ products }) {
  return (
    <Center style={{ padding: "0px", width: "900px" }}>
      <h2 className="text-[2rem] font-medium px-0 pt-[30px] pb-2 text-gray-700">New Arrivals</h2>     
    <div className="grid grid-cols-4 gap-7 pt-[10px]">
      {/* This is the map function that will loop through the products array and render the ProductBox component for each product */}
      {products?.length > 0 &&  products.map(product => (
        <ProductBox key={product._id} {...product} />
      ))}
    </div>
    </Center>
  );
}