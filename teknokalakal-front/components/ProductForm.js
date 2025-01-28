import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import swal from "sweetalert2";
import LoadingIndicator from "./LoadingIndicator";
import { CldUploadWidget } from "next-cloudinary";
import XIcon from "./icons/XIcon";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  stock: existingStock,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
  videoLink: existingVideoLink,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [parentCategory, setParentCategory] = useState(""); // New state for parent category
  const [productProperties, setProductProperties] = useState(assignedProperties || []);
  const [price, setPrice] = useState(existingPrice || "");
  const [stock, setStock] = useState(existingStock || "");
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [goToProducts, setGoToProducts] = useState(false);
  const [uploadedImages, setUploadedImages] = useState(existingImages || []);
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [videoLink, setVideoLink] = useState(existingVideoLink || '');
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();
    setIsSaving(true);

    // Check for empty fields
    if (!title.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Product Name Required',
        text: 'Please enter a product name before saving.',
      });
      setIsSaving(false); 
      return;
    }
    if (!description.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Description Required',
        text: 'Please enter a description before saving.',
      });
      setIsSaving(false); // Reset isSaving on error
      return;
    }
    if (!price || isNaN(price)) {
      swal.fire({
        icon: 'error',
        title: 'Price Required',
        text: 'Please enter a valid price before saving.',
      });
      setIsSaving(false); // Reset isSaving on error
      return;
    }
    if (!stock || isNaN(stock)) {
      swal.fire({
        icon: 'error',
        title: 'Stock Required',
        text: 'Please enter a valid stock amount before saving.',
      });
      setIsSaving(false); // Reset isSaving on error
      return;
    }
  
    const data = {
      title,
      description,
      price,
      stock,
      images: uploadedImages.map((image) => ({ public_id: image.public_id, link: image.link })),
      category,
      parentCategory, // Include the parentCategory in the save data
      properties: productProperties,
      imagesToDelete,
      videoLink,
    };

  
    try {
      if (_id) {
        // Update existing product
        await axios.put("/api/vendors-products", { ...data, _id });
        swal.fire('Success!', data.message || 'Product updated successfully!', 'success'); 
      } else {
        // Create new product
        await axios.post("/api/vendors-products", data);
        swal.fire('Product Creation', data.message || 'Product created successfully!', 'success'); 
      }
      setGoToProducts(true);
    } catch (error) {
      swal.fire('Error', 'Failed to save the product. Please try again.', 'error');
      console.error(error);
    }
    setIsSaving(false); // Reset isSaving after save
  }


  if (goToProducts) {
    router.push("/vendor/products");
  }

  function handleCategoryChange(ev) {
    const selectedCategory = ev.target.value;
    setCategory(selectedCategory);

    // Find the selected category and check for a parent
    const selectedCategoryInfo = categories.find((c) => c._id === selectedCategory);
    if (selectedCategoryInfo && selectedCategoryInfo.parent) {
      setParentCategory(selectedCategoryInfo.parent); // Set the parent category
    } else {
      setParentCategory(""); // Reset if there's no parent
    }
  }

  const handleImageUpload = (info) => {
    const newImage = { link: info.secure_url, public_id: info.public_id, };
    setUploadedImages((prev) => [...prev, newImage]);
  };
  
  function removePhoto(image) {
    const newImages = [...uploadedImages];
    const imageIndex = newImages.findIndex((img) => img.public_id === image.public_id);
    if (imageIndex !== -1) {
      newImages.splice(imageIndex, 1);
      setUploadedImages(newImages);
      setImagesToDelete((prevImagesToDelete) => [...prevImagesToDelete, image]);
    } else {
      console.error("Image not found");
    }
  }
  

  function addProperty() {
    setProductProperties((prev) => [
      ...prev,
      { name: "", values: [""] },  // Add default property with empty values
    ]);
  }
  
  function handlePropertyNameChange(index, newName) {
    setProductProperties((prev) => {
      const updatedProperties = [...prev];
      updatedProperties[index].name = newName;
      return updatedProperties;
    });
  }
  
  function handlePropertyValuesChange(index, newValues) {
    setProductProperties((prev) => {
      const updatedProperties = [...prev];
      updatedProperties[index].values = newValues;
      return updatedProperties;
    });
  }
  
  function removeProperty(index) {
    setProductProperties((prev) => prev.filter((_, i) => i !== index));
  }

  function removeValue(propertyIndex, valueIndex) {
    setProductProperties((prev) => {
      const updatedProperties = [...prev];
      updatedProperties[propertyIndex].values.splice(valueIndex, 1); // Remove specific value
      return updatedProperties;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(...parentCat.properties);
      catInfo = parentCat;
    }
  }

  return (
    <form
      onSubmit={saveProduct}
      disabled={isSaving}
      className={`p-6 bg-white rounded-lg shadow-lg ${
        isSaving ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 justify-between items-center mb-3">
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-medium text-green-900">
            Product Name
          </label>
          <input
            type="text"
            placeholder="Enter product name"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-medium text-green-900">
            Category
          </label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-green-300 rounded-lg bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="" className="text-gray-500">
              Uncategorized
            </option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-green-900">
          Description
        </label>
        <textarea
          placeholder="Enter product description"
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-3">
        <div>
          <label className="block text-sm font-medium text-green-900">
            Price
          </label>
          <input
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(ev) => setPrice(ev.target.value)}
            className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-green-900">
            Stock
          </label>
          <input
            type="number"
            placeholder="Enter stock quantity"
            value={stock}
            onChange={(ev) => setStock(ev.target.value)}
            className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-green-900">
          Photos
        </label>
        <div className="flex flex-wrap items-center md:items-start justify-center md:justify-start gap-4 ">
          {uploadedImages.map((image) => (
            <div key={image.id} className="relative">
              <img
                src={image.link}
                alt="Product"
                className="w-24 h-24 rounded-md object-cover shadow-md border border-green-300"
              />
              <button
                type="button"
                onClick={() => removePhoto(image)}
                className="absolute top-0 right-0 text-white bg-red-500 p-1 rounded-full"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <CldUploadWidget
            signatureEndpoint="/api/sign-cloudinary-params"
            options={{
              sources: ["local", "google_drive"],
              folder: "productsVendor",
            }}
            onSuccess={(result) => handleImageUpload(result.info)}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="cursor-pointer flex items-center justify-center w-24 h-24 border-2 border-dashed border-green-300 rounded-lg bg-green-50 hover:bg-green-100 text-green-500"
              >
                Add Photo
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-green-900">
          Link tutorial video
        </label>
        <input
          type="text"
          value={videoLink}
          placeholder="Paste video URL"
          onChange={(ev) => setVideoLink(ev.target.value)}
          className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-green-900">
          Properties
        </label>
        {productProperties.map((property, index) => (
          <div
            key={index}
            className="mb-4 p-4 bg-green-50 rounded-lg shadow-md"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-green-900">
                Property Name
              </label>
              <input
                type="text"
                value={property.name}
                onChange={(ev) =>
                  handlePropertyNameChange(index, ev.target.value)
                }
                className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-900">
                Values
              </label>
              {property.values.map((value, vIndex) => (
                <div key={vIndex} className="flex items-center gap-3 mt-3">
                  <input
                    type="text"
                    value={value}
                    onChange={(ev) => {
                      const newValues = [...property.values];
                      newValues[vIndex] = ev.target.value;
                      handlePropertyValuesChange(index, newValues);
                    }}
                    className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeValue(index, vIndex)}
                    className="bg-red-500 text-white md:px-3 p-2 md:py-3 rounded-md hover:bg-red-600"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-start mt-3 text-[12px] sm:text-sm md:text-base gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handlePropertyValuesChange(index, [...property.values, ""])
                  }
                  className=" bg-blue-500 text-white px-2 md:px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 hover:scale-105"
                >
                  Add Value
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 md:px-4 py-2 rounded-lg shadow-md hover:bg-red-600 hover:scale-105"
                  onClick={() => removeProperty(index)}
                >
                  Remove Property
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addProperty}
          className=" bg-green-500 text-white md:px-4 px-2 py-1 md:py-2 rounded-lg shadow-md hover:bg-green-600"
        >
          Add Property
        </button>
      </div>

      <div className="flex flex-row-reverse md:justify-end justify-center gap-2">
        <button
          type="button"
          className={`md:px-6 px-3 py-2 bg-gray-500 rounded-lg shadow-md text-white transition-colors ${
            isSaving ? " opacity-50 cursor-not-allowed" : " hover:bg-gray-400"
          }`}
          disabled={isSaving}
          onClick={() => router.push("/vendor/products")}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`md:px-6 px-3 py-2 rounded-lg shadow-md bg-green-600 text-white transition-colors ${
            isSaving ? " opacity-50 cursor-not-allowed" : " hover:bg-green-700"
          }`}
        >
          {isSaving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
