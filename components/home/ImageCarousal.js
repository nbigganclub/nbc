import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import image1 from "../assets/Carousal/msg1545168757-1213.jpg";
import image2 from "../assets/Carousal/msg1545168757-1212.jpg";
import image3 from "../assets/Carousal/msg1545168757-1211.jpg";

export default function ImageCarousal({ className }) {
    return (
        <section>
            <div className="text-center py-4">
                <p className="text-xl lg:text-2xl font-medium text-black dark:text-gray-200 text-center pb-4 px-2 border-b-2 inline-block">Gallery</p>
            </div>
            <Carousel showThumbs={false} className={className}>
                <div>
                    <img src={image1.src} height="400" width="400" />
                </div>
                <div>
                    <img src={image2.src} height="400" width="400" />
                </div>
                <div>
                    <img src={image3.src} height="400" width="400" />
                </div>
            </Carousel>
        </section>
    );
}