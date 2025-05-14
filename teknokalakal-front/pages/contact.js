import Center from "@/components/Center";
import Layout from "@/components/Layout";

export default function ContactPage() {
    return (
        <Layout>
            <Center>
                <div className="max-w-6xl mx-auto p-6 space-y-12">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Contact Info Section */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-lg shadow-md bg-gradient-to-br from-blue-50 to-white">
                                <h2 className="text-xl font-medium text-gray-700 mb-2">Email Us</h2>
                                <p className="text-sm text-gray-600">
                                    Reach out to us via email, and we’ll get back to you as soon as possible.
                                </p>
                                <a
                                    href="mailto:benedicto.angelito.a@gmail.com"
                                    className="block mt-4 text-sm md:text-base  text-blue-500 font-medium hover:text-blue-600"
                                >
                                    benedicto.angelito.a@gmail.com
                                </a>
                            </div>

                            <div className="p-6 rounded-lg shadow-md bg-gradient-to-br from-blue-50 to-white">
                                <h2 className="text-xl font-medium text-gray-700 mb-2">Call Us</h2>
                                <p className="text-sm text-gray-600">
                                    We’re available to take your calls during business hours.
                                </p>
                                <a
                                    href="tel:+1234567890"
                                    className="block mt-4 text-blue-500 font-medium hover:text-blue-600"
                                >
                                    +123 456 7890
                                </a>
                            </div>

                            <div className="p-6 rounded-lg shadow-md bg-gradient-to-br from-blue-50 to-white">
                                <h2 className="text-xl font-medium text-gray-700 mb-2">Visit Us</h2>
                                <p className="text-sm text-gray-600">
                                    Stop by at our office to discuss your queries in person.
                                </p>
                                <p className="mt-4 text-gray-700">Amado ST., Tapuac, Dagupan City, Philippines</p>
                            </div>
                        </div>

                        {/* Contact Form Section */}
                        <div className="bg-white p-8 rounded-lg shadow-lg">
                            <form
                                action="mailto:benedicto.angelito.a@gmail.com"
                                method="POST"
                                encType="text/plain"
                                className="space-y-6"
                            >
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                        Your Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-sm"
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:ring focus:ring-blue-300 text-sm font-medium shadow-md transition-all transform hover:scale-105"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </Center>
        </Layout>
    );
}
