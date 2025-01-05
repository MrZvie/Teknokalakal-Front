import Center from "@/components/Center";
import Layout from "@/components/Layout";

export default function AboutPage() {
    return (
        <Layout>
            <Center style={{ padding: "0px", maxWidth: "1200px", width: "100%" }}>
                {/* Hero Section */}
                <section className="mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr,.8fr] gap-10 items-center">
                        {/* Left Content */}
                        <div>
                            <h1 className="text-3xl md:text-5xl text-center font-bold text-green-700 mb-6">About TeknoKalakal</h1>
                            <p className="text-base md:text-lg text-center text-gray-700 leading-relaxed">
                                At <span className="font-bold">TeknoKalakal</span>, we understand the importance of having
                                the right tools and equipment to get the job done efficiently and effectively. That’s why
                                we’ve created an online marketplace specifically designed for farmers and fishermen, 
                                providing access to a vast range of high-quality agricultural tools and equipment at 
                                unbeatable prices.
                            </p>
                            <p className="mt-4 text-base text-center md:text-lg text-gray-700 leading-relaxed">
                                Whether you're a small-scale farmer or a commercial fisherman, we are here to support 
                                your journey with fast and reliable shipping, a user-friendly interface, and regular 
                                promotions that make it even easier to invest in your productivity and growth.
                            </p>
                        </div>

                        {/* Right Content */}
                        <div className="relative">
                             <img
                                src="https://i.pinimg.com/originals/54/c7/a5/54c7a56c9dc40c42f4af88f51a5076a7.gif"
                                alt="People in Action"
                                className="w-[300px] md:w-[400px] h-[280px] md:h-[380px] max-h-[500px] object-cover mx-auto"
                            />
                        </div>
                    </div>
                </section>

                {/* Core Offerings Section */}
                <section className="mt-16 bg-green-100 py-12 rounded-lg">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-semibold text-green-800 mb-6">What We Offer</h2>
                        <p className="text-gray-700 mb-10 max-w-4xl mx-auto text-base md:text-lg">
                            Explore our comprehensive catalog of agricultural and fishing products, carefully curated to
                            meet the unique needs of farmers and fishermen. From tractors to fishing nets, our goal is to 
                            empower your operations with the best tools available.
                        </p>

                        {/* Grid of Products */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Product 1 */}
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <img
                                    src="https://i.pinimg.com/originals/0c/ba/2d/0cba2d169e437172e2a6ce34e4655228.gif"
                                    alt="Tractor"
                                    className="h-36 mx-auto mb-4"
                                />
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Farming Machinery</h3>
                                <p className="text-sm md:text-gray-600">
                                    Reliable tractors, plows, and sprayers to maximize your farming productivity.
                                </p>
                            </div>

                            {/* Product 2 */}
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <img
                                    src="https://gifsec.com/wp-content/uploads/2022/10/fishing-gif-13.gif"
                                    alt="Fishing Rod"
                                    className="h-36 mx-auto mb-4"
                                />
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Fishing Gear</h3>
                                <p className="text-sm md:text-gray-600">
                                    Premium fishing rods, nets, and accessories to simplify your catch.
                                </p>
                            </div>

                            {/* Product 3 */}
                            <div className="p-6 bg-white rounded-lg shadow-md text-center">
                                <img
                                    src="https://media2.giphy.com/media/KbNdzZH7GyJnXuJJj5/giphy.gif"
                                    alt="Water Pumps"
                                    className="h-36 mx-auto mb-4"
                                />
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Irrigation Tools</h3>
                                <p className="text-sm md:text-gray-600">
                                    Advanced water pumps and sprinklers to keep your fields thriving.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section className="mt-16 text-center py-12 bg-gray-50 rounded-lg">
                    <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-6">Why Choose TeknoKalakal?</h2>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                        At <span className="font-bold">TeknoKalakal</span>, we don’t just sell tools; we foster 
                        partnerships. Our commitment to quality, affordability, and customer satisfaction ensures 
                        that you have everything you need to succeed in your agricultural or fishing endeavors.
                    </p>
                    <p className="mt-4 text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                        With regular promotions, unbeatable prices, and fast, reliable shipping, we’re here to help 
                        you grow your business and achieve your goals.
                    </p>
                </section>

                {/* Closing Section */}
                <section className="mt-16 text-center py-12 bg-green-200 rounded-lg">
                    <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">Join Our Community</h2>
                    <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
                        Discover the difference <span className="font-bold">TeknoKalakal</span> can make for your farming 
                        or fishing operations. Start browsing today and take the next step toward efficiency and success!
                    </p>
                </section>
            </Center>
        </Layout>
    );
}
