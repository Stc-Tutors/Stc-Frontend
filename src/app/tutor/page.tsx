import Image from "next/image";
import stock from '../public/stock.webp';
import { MdOutlineMailOutline } from "react-icons/md";
import { FcGlobe } from "react-icons/fc";
import { IoMdContact, IoMdBook } from "react-icons/io";
import { GiUpgrade } from "react-icons/gi";
import { FcBarChart } from "react-icons/fc";
import { FcRating } from "react-icons/fc";


export default function TutorPage() {
    return <section className="bg-gray-100">
        <div className="bg-white flex justify-between py-12 pl-24 pr-24 ml-8 mr-9">
            <div className="flex gap-4">
                <div className="mt-2">   
                    <Image src="/public/stock.webp" width={50} height={50}  alt=""/> 
                </div>
                <div>
                    <h1 className="font-bold text-2xl mb-2">Willaim Krutz</h1>
                    <p className="text-gray-500">Mathematics instructor at SC Tutor</p>
                </div>   
             </div>
            <div>
                <button className="bg-blue-500 hover:bg-blue-700 py-2 px-3 text-white rounded cursor-pointer transition duration-300 ease-in-out">Send Message</button>
            </div>
        </div>

        <section className="bg-white mt-8 ml-8 mr-9 pl-12 py-5">
            <div className="flex gap-5">
                <div>
                    <div className="flex gap-2">
                        <MdOutlineMailOutline className="mt-1"/> 
                        <h3 className="font-bold">Email ID</h3>
                    </div>
                    <input type="text" placeholder="Enter Your Email" />
                </div>
                <div>
                    <div className="flex gap-2">
                        <FcGlobe className="mt-1"/>
                        <label htmlFor="country" className="font-bold">Nationality</label>
                    </div>
                        <input type="text" placeholder="Input Your Nationality" />
                </div>
            </div>
            <div className="flex gap-5 mt-5">
                <div>
                    <div className="flex gap-2">
                        <IoMdContact className="mt-1"/>
                        <h3 className="font-bold">Gender</h3>
                    </div>
                    <input type="text" placeholder="Male/Female" />
                </div>
                <div>
                    <div className="flex gap-2">
                        <IoMdBook className="mt-1"/>
                        <h3 className="font-bold">Curriculum</h3>
                    </div>
                  <input type="text" placeholder="Course Outlline" />
                </div>
            </div>
            <div className="flex gap-33 mt-5">
                <div>
                    <div className="flex gap-2">
                        <GiUpgrade className="mt-1"/>
                        <h3 className="font-bold">Grade</h3>
                    </div>
                    <p>Beginner</p>
                </div>
                <div>
                    <div className="flex gap-2">
                        <FcBarChart className="mt-1"/>
                        <h3 className="font-bold">Current result</h3>
                    </div>
                    <p>Excellent</p>
                </div>
            </div>    
        </section>

        <div className="bg-white mt-8 ml-8 mr-9 pl-12">
            <h1 className="font-bold text-xl py-5">Educational Background</h1>
            <div>
               <input type="text" placeholder="Name Of Degree" className="font-bold block mb-2" />
               <input type="text" placeholder="School Attended"  className="font-bold block pb-3"/>
            </div>
        </div>

        <div className="bg-white mt-8 ml-8 mr-9 pl-12">
            <h1 className="font-bold text-xl py-5">Reviews</h1>
            <div className="flex gap-30">
                <h1 className="font-bold mb-4">Tomide James</h1>
                <div className="flex gap-2">
                    <p>4.9</p>
                    <FcRating className="mt-1"/>
                </div> 
            </div>
            <p className="text-gray-500">Having Mr Ola as my child's mathematics tutor has been an absolute game-changer.His dedication to teaching
               and ability to explain complex concepts in a clear and concise manner have significantly improved my child's
               understanding and performance in math. I highly recommend Mr Ola to any parent seeking a knowledgeable and 
               supportive tutor for their child.  
            </p>

            <div className="flex gap-30 mt-5">
                <h1 className="font-bold mb-4">Funto Tolu</h1>
                <div className="flex gap-2">
                    <p>4.4</p>
                    <FcRating className="mt-1"/>
                </div> 
            </div>
            <p  className="text-gray-500">
            We are incredibly grateful to have Mr Ola as our child's mathematics tutor. His patient and encouraging approach has only boosted our child's confidence in math but also helped them develop a genuine interest in the subject. Mr Ola's dedication to his students' success is evident in every session, and we couldn't be happier with the progress our child has made under his guidance. 
            </p>    
        </div>       
       
    </section>
    
}