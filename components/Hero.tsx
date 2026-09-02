import Image from 'next/image';
import { R2_IMAGE_BASE_URL } from '../lib/constants';

const Hero = () => {
    return (
        <section className="relative w-full h-[80vh] md:h-screen bg-gray-100 overflow-hidden">
            <Image
                src={`${R2_IMAGE_BASE_URL}/gallery/hair/hair-2.jpg`}
                alt="Vivazen Hero Models"
                fill
                className="object-cover object-top"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            <div className="absolute bottom-20 left-0 w-full text-center md:text-left md:px-20 z-10">
                {/* Optional Caption Layout depending on user preference, 
                     for now purely keeping the image as the main focus as per T&G design */}
            </div>
        </section>
    );
};

export default Hero;
