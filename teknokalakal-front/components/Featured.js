

export default function Featured() {
  return (
    <div className="bg-aqua-forest-600 rounded-md text-white mt-7 w-[700px] h-[250px] mx-auto py-5 px-5">
      
        <div className="grid grid-cols-2 gap-3 place-items-center">
          <div className="flex flex-col justify-center gap-5">
            <h1 className=" font-normal text-4xl">Featured</h1>
            <p className=" text-sm">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Et iure
              error nesciunt libero officiis numquam ipsum, impedit obcaecati
              culpa! Placeat, fugit molestiae obcaecati iusto ipsam ipsa totam
              non sunt quas!
            </p>
          </div>
          <div className="flex items-center justify-center h-full">
            <img
              className="max-w-full max-h-full object-cover"
              src="https://res.cloudinary.com/dy0hck8rf/image/upload/v1728106770/qdk6gpwwyexciqrdiza7.jpg"
              alt=""
            />
          </div>
        </div>
      
    </div>
  );
}