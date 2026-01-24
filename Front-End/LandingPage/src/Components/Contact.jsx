import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Mail, Phone, Ticket } from "lucide-react";

function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { error } = await supabase
      .from("contact_forum_messages")
      .insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          message: formData.message,
        },
      ]);

    if (error) throw error;

    alert("Message sent successfully!");
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      message: "",
    });
  } catch (error) {
    alert("Error sending message.");
  }
};


  return (
    <section id="contact">
    <div className="w-full bg-gray-50 pt-20 pb-10 px-6 md:px-12 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-start">

        {/* LEFT SIDE FORM */}
        <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 dark:bg-black dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 dark:text-white">Contact <span className="font-bold text-green-600 dark:text-green-400">Us</span></h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <input
  type="text"
  name="firstName"
  value={formData.firstName}
  onChange={handleChange}
  placeholder="First Name"
  className="border border-gray-200 rounded-lg px-4 py-3 w-full ..."
/>
              <input
  type="text"
  name="lastName"
  value={formData.lastName}
  onChange={handleChange}
  placeholder="Last Name"
  className="border dark:text-white border-gray-200 rounded-lg px-4 py-3 w-full ..."
/>

            </div>

            <input
  type="text"
  name="phone"
  value={formData.phone}
  onChange={handleChange}
  placeholder="Phone Number"
  className="border border-gray-200 rounded-lg px-4 py-3 w-full ..."
/>


            <textarea
  name="message"
  value={formData.message}
  onChange={handleChange}
  placeholder="Message"
  rows="6"
  className="border dark:text-white border-gray-200 rounded-lg px-4 py-3 w-full ..."
></textarea>




            <button
  type="submit"
  className="w-full dark:text-white bg-black text-white py-3 ..."
>
              SEND MESSAGE
            </button>
          </form>
        </div>

        {/* RIGHT SIDE INFO */}
        <div className="flex flex-col justify-center mt-8 md:mt-20">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 dark:text-white">
            Get In <span className="text-green-600 dark:text-green-500"> Touch</span>
          </h2>
          <p className="text-gray-600 leading-relaxed mb-10 max-w-md dark:text-gray-300">
Need help? Get in touch with us.          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-black text-white rounded-full p-3">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-200">Phone</div>
                <div className="font-semibold text-gray-900  dark:text-gray-200">+94 77 249 2154</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-black text-white rounded-full p-3 ">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm text-gray-500  dark:text-gray-200">Email</div>
                <div className="font-semibold text-gray-900  dark:text-gray-200">ricevisionlanka@gmail.com</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
    </section>
  );
}

export default Contact;
