import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { BlurText } from '@/components/ui/BlurText';
import officeHome from '@/assets/office_home.png';

const galleryImages = [
    '/home/gallery-1.png',
    '/home/gallery-2.png',
    '/home/gallery-3.png',
];

const spaceTypes = [
    {
        title: 'PUBLIC SPACE',
        image: '/home/public-space.png',
    },
    {
        title: 'PRIVATE SPACE',
        image: '/home/private-space.png',
    },
    {
        title: 'MEETING SPACE',
        image: '/home/meeting-space.png',
    },
    {
        title: 'CUSTOM SPACE',
        image: '/home/custom-space.png',
    },
];

export function Home() {
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

    const nextImage = () => {
        setCurrentGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = () => {
        setCurrentGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    return (
        <>
            <PublicHeader />
            <div className="space-y-0 bg-[#FAFAFA]">
                {/* Hero Section - Editorial Layout */}
                <section className="bg-[#FAFAFA] pt-24 pb-12 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-16">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] items-start gap-12 lg:gap-24">
                            {/* Left - Large Editorial Heading */}
                            <div>
                                <h1 className="text-8xl font-bold text-slate-900 leading-[0.9] tracking-tight">
                                    <BlurText
                                        text={["COLLABORATE", "IN VIBRANT", "COWORKING"]}
                                        delay={0.2}
                                        wordDelay={0.5}
                                    />
                                </h1>
                            </div>

                            {/* Right - Description + CTA */}
                            <div className="flex flex-col items-end pt-4">
                                <motion.p
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1.0, delay: 2.2, ease: "easeOut" }}
                                    className="text-slate-500 text-[15px] leading-relaxed text-right font-light"
                                >
                                    Our space is equipped with high-speed internet, printing and scanning facilities, meeting rooms, and a fully stocked kitchen. We also host a variety of events and workshops to help you grow your skills and network.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 2.8, ease: "easeOut" }}
                                    className="mt-12"
                                >
                                    <Link to="/dashboard/seats">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative w-32 h-32 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-xl shadow-blue-600/20 transition-all cursor-pointer group"
                                        >
                                            {/* Circular rotating text */}
                                            <svg className="absolute inset-0 w-full h-full animate-spin-slow" style={{ animationDuration: '30s' }}>
                                                <path
                                                    id="circlePathHero"
                                                    d="M 64,64 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
                                                    fill="none"
                                                />
                                                <text className="text-[10px] fill-white/80 tracking-[0.15em] font-medium uppercase">
                                                    <textPath href="#circlePathHero" startOffset="0%">
                                                        BOOK A SPACE • BOOK A SPACE •
                                                    </textPath>
                                                </text>
                                            </svg>

                                            {/* Minimal arrow icon */}
                                            <IconArrowRight size={28} className="text-white relative z-10 group-hover:translate-x-1 transition-transform" />
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Image Reveal Section - After text animations */}
                    <div className="max-w-7xl mx-auto px-16 mt-20">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.4, delay: 3.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative rounded-[40px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] aspect-[21/9] bg-slate-100"
                        >
                            <img
                                src={officeHome}
                                alt="CoWorking Space"
                                className="w-full h-full object-cover"
                            />
                            {/* Subtle overlay for depth */}
                            <div className="absolute inset-0 bg-slate-900/10" />
                        </motion.div>
                    </div>
                </section>

                {/* About Us Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white px-16 py-8 max-w-7xl mx-auto"
                >
                    <div className="text-left mb-8">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-blue-600 text-lg font-semibold tracking-wider uppercase"
                        >
                            ABOUT US
                        </motion.p>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold text-slate-800 max-w-4xl leading-relaxed"
                        >
                            OUR COWORKING SPACE WAS FOUNDED ON THE BELIEF THAT WORKING TOGETHER IN A SUPPORTIVE COMMUNITY CAN LEAD TO GREATER SUCCESS AND FULFILLMENT.
                        </motion.h2>
                    </div>
                </motion.section>

                {/* Our Space Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#FAFAFA] px-16 py-8 max-w-7xl mx-auto"
                >
                    <div className="mb-12">
                        <h2 className="text-5xl font-bold text-slate-900 mb-4">
                            OUR <span className="text-blue-600">SPACE</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl">
                            We offer a range of membership options to meet your unique needs, including hot desks, dedicated desks, and private offices. Each membership includes access to all of our amenities and community events.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {spaceTypes.map((space, index) => (
                            <motion.div
                                key={space.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer shadow-lg"
                            >
                                <img
                                    src={space.image}
                                    alt={space.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="text-white text-xl font-bold">{space.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Amenities Ticker */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white py-6 overflow-hidden border-y border-slate-200"
                >
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="flex gap-8 whitespace-nowrap"
                    >
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-8">
                                <span className="text-slate-400 text-lg">PRINTING</span>
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                <span className="text-slate-900 text-lg font-semibold">HIGH-SPEED INTERNET</span>
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                <span className="text-slate-400 text-lg">FULLY STOCKED KITCHENETTE</span>
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                <span className="text-slate-400 text-lg">MEETING ROOMS</span>
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Gallery Section with Carousel */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#FAFAFA] px-16 py-20 max-w-7xl mx-auto"
                >
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-5xl font-bold text-slate-900">
                            OUR <span className="text-blue-600">GALLERY</span>
                        </h2>

                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={prevImage}
                                className="w-14 h-14 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                            >
                                <IconChevronLeft size={24} className="text-slate-700" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={nextImage}
                                className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                            >
                                <IconChevronRight size={24} className="text-white" />
                            </motion.button>
                        </div>
                    </div>

                    <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentGalleryIndex}
                                src={galleryImages[currentGalleryIndex]}
                                alt={`Gallery ${currentGalleryIndex + 1}`}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {/* Gallery indicators */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {galleryImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentGalleryIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentGalleryIndex
                                        ? 'bg-blue-600 w-8'
                                        : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Testimonial Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white px-16 py-20 max-w-7xl mx-auto"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="w-80 h-80 rounded-3xl overflow-hidden bg-blue-600 shadow-xl">
                                <img
                                    src="/home/testimonial.png"
                                    alt="Alexander John"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-slate-600 text-lg leading-relaxed mb-6">
                                "I love this coworking space! It's clean, staff is friendly, and I've met inspiring people. Their events and workshops are informative and engaging. Highly recommend for a collaborative work environment."
                            </p>
                            <h3 className="text-blue-600 text-xl font-bold">Alexander John</h3>
                            <p className="text-slate-500">Freelancer Web Developer</p>
                        </motion.div>
                    </div>
                </motion.section>
            </div>
        </>
    );
}

