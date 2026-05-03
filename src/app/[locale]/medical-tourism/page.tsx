import React from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, CheckCircle2, Star, ArrowRight, Activity, Leaf, ShieldCheck, Stethoscope, Quote, Building2, MapPin, Award, Tag, HeartHandshake, PlusSquare } from "lucide-react";
import { allPackages } from "@/data/packages";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export default function MedicalTourismPage() {
    // Get the 3 specific Kerala medical packages
    const medicalPackages = allPackages.filter(p => p.id >= 21 && p.id <= 23);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2400&auto=format&fit=crop"
                        alt="Kerala Backwaters Healing"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm mb-6 px-4 py-1 text-sm tracking-wider uppercase">
                        Kerala Medical Tourism
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        World-Class Healthcare, <br /> <span className="text-teal-400">A Healing Paradise.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Kerala offers the perfect blend of advanced medical treatments, authentic Ayurveda, and serene environments for your complete recovery.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-6 text-lg h-auto">
                            Book a Consultation
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-teal-900 rounded-full px-8 py-6 text-lg h-auto backdrop-blur-sm bg-white/10">
                            Explore Packages
                        </Button>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 text-teal-700 font-bold tracking-wider uppercase text-sm mb-2">
                                <span>About Maram Medical Tourism</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Your Trusted Partner in Kerala Medical Tourism
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Maram Medical & Tourism bridges the gap between global patients and world-class healthcare in Kerala. We ensure compassionate service, cost-effective treatments, and personalized attention at every step of your healing journey.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6 pt-6">
                                <div className="bg-[#eef8f3] p-6 rounded-3xl">
                                    <div className="bg-[#1b5e50] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Accredited Excellence</h3>
                                    <p className="text-slate-600 text-sm">Partnered with globally recognized JCI & NABH certified hospitals.</p>
                                </div>
                                <div className="bg-[#eef8f3] p-6 rounded-3xl">
                                    <div className="bg-[#1b5e50] w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                        <Stethoscope className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Personalized Care</h3>
                                    <p className="text-slate-600 text-sm">Dedicated coordinators to ensure comfort, clarity, and care 24x7.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop"
                                alt="Medical Professional providing care"
                                className="relative z-10 rounded-[2rem] shadow-xl w-full object-cover h-[600px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 text-center max-w-5xl">
                    <div className="inline-flex items-center gap-2 text-[#1b5e50] font-bold tracking-wider uppercase text-sm mb-4">
                        <span>Why Choose Maram?</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Your Wellness Partner in Every Step</h2>
                    <p className="text-slate-600 text-lg mb-16">Experience the perfect blend of medical excellence, traditional healing, and compassionate care in God's Own Country.</p>

                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        {[
                            { icon: Tag, title: "Cost-Effective Care", desc: "High-quality treatments at 60-80% lower cost than Western countries." },
                            { icon: HeartHandshake, title: "End-to-End Support", desc: "Visa, airport pickup, interpreter, hotel, and recovery tours." },
                            { icon: CheckCircle2, title: "Accredited Hospitals", desc: "Partnerships with JCI & NABH certified hospitals for guaranteed safety." },
                            { icon: PlusSquare, title: "Top Medical Experts", desc: "Access to renowned specialists and super-specialists." }
                        ].map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div key={i} className="bg-[#f4f9f6] border border-[#e8f2ec] rounded-[2rem] p-8 flex items-center gap-6 hover:shadow-[0_8px_30px_rgb(27,94,80,0.1)] hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-20 h-20 shrink-0 rounded-full bg-[#cbeada] flex items-center justify-center shadow-inner">
                                        <Icon className="w-8 h-8 text-[#1b5e50] stroke-[2]" />
                                    </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Popular Packages */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 text-teal-600 font-semibold tracking-wider uppercase text-sm mb-4">
                            <Leaf className="w-5 h-5" />
                            <span>Wellness Programs</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900">Our Popular <span className="text-teal-600">Packages</span></h2>
                        <p className="text-slate-600 max-w-2xl mx-auto mt-4 text-lg">Curated medical and wellness experiences tailored for your complete recovery and rejuvenation.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {medicalPackages.map((pkg) => (
                            <Link href={`/packages/${pkg.id}`} key={pkg.id} className="group block">
                                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl h-full flex flex-col group-hover:-translate-y-2 bg-white">
                                    <div className="relative h-64 overflow-hidden">
                                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-all z-10"></div>
                                        <img
                                            src={pkg.image}
                                            alt={pkg.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <Badge className="absolute top-4 right-4 z-20 bg-white/90 text-teal-700 hover:bg-white border-0 font-semibold backdrop-blur-sm shadow-sm">
                                            {pkg.duration}
                                        </Badge>
                                    </div>
                                    <CardContent className="p-6 flex-grow flex flex-col">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-teal-600 font-bold text-lg">${pkg.price}</span>
                                            <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                                                <Star className="w-4 h-4 fill-current" />
                                                {pkg.rating} ({pkg.reviews})
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{pkg.title}</h3>
                                        <p className="text-slate-600 mb-6 flex-grow">{pkg.description}</p>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                            <span className="text-sm font-medium text-slate-500">View Details</span>
                                            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors text-teal-600">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partnered Hospitals */}
            <section className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 text-teal-600 font-semibold tracking-wider uppercase text-sm mb-4">
                            <Building2 className="w-5 h-5" />
                            <span>Our Partners</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">World-Class <span className="text-teal-600">Hospitals</span></h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">We partner with internationally accredited medical facilities to ensure you receive the highest standard of care.</p>
                    </div>

                    <div className="max-w-6xl mx-auto px-12">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {[
                                    { name: "Apollo Hospitals", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop" },
                                    { name: "Aster Medcity", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop" },
                                    { name: "Amrita Hospital", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1538108149393-cebb47ac0925?q=80&w=800&auto=format&fit=crop" },
                                    { name: "KIMSHealth", loc: "Trivandrum, Kerala", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop" },
                                    { name: "Rajagiri Hospital", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?q=80&w=800&auto=format&fit=crop" }
                                ].map((hospital, index) => (
                                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                                            <div className="h-64 overflow-hidden relative">
                                                <img
                                                    src={hospital.img}
                                                    alt={hospital.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <h3 className="text-white font-bold text-xl mb-1">{hospital.name}</h3>
                                                    <p className="text-teal-200 text-sm flex items-center gap-1.5 font-medium">
                                                        <MapPin className="w-4 h-4" />
                                                        {hospital.loc}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="-left-12 bg-white text-teal-900 border-slate-200 hover:bg-teal-50 hover:text-teal-700 w-12 h-12" />
                            <CarouselNext className="-right-12 bg-white text-teal-900 border-slate-200 hover:bg-teal-50 hover:text-teal-700 w-12 h-12" />
                        </Carousel>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-teal-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-teal-800 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-950 rounded-full blur-3xl opacity-50"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">What Our Patients Say</h2>
                        <p className="text-teal-100 max-w-2xl mx-auto text-lg">Real stories of healing and transformation from our global family of patients.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Jenkins", loc: "UK", text: "The Ayurvedic wellness retreat completely transformed my health. The doctors were incredibly attentive and the environment was perfect for healing." },
                            { name: "Michael Chang", loc: "Singapore", text: "I came for a holistic healing program and was blown away by the level of care and modern facilities integrated with traditional practices." },
                            { name: "Emma Robertson", loc: "Australia", text: "My yoga and wellness journey in Kerala was life-changing. The serene backwaters provided the ultimate backdrop for recovery." }
                        ].map((review, i) => (
                            <Card key={i} className="bg-white/10 border-white/20 backdrop-blur-md text-white">
                                <CardContent className="p-8">
                                    <Quote className="w-10 h-10 text-teal-400 mb-6 opacity-50" />
                                    <p className="text-lg leading-relaxed mb-6 font-light">"{review.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center font-bold text-xl">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{review.name}</h4>
                                            <p className="text-teal-300 text-sm">{review.loc}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Journey Stepper */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900">Your Healing <span className="text-teal-600">Journey</span></h2>
                        <p className="text-slate-600 mt-4 text-lg">We've streamlined the process to make your journey to recovery as smooth as possible.</p>
                    </div>

                    <div className="relative space-y-12 pb-4">
                        {/* Connecting Line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-teal-200 -translate-x-1/2 z-0"></div>

                        {[
                            { title: "Initial Consult", desc: "Connect with our experts online to discuss your needs.", icon: "01" },
                            { title: "Travel & Stay", desc: "We arrange your flights, visas, and comfortable accommodation.", icon: "02" },
                            { title: "Treatment & Care", desc: "Undergo your treatment with world-class medical professionals.", icon: "03" },
                            { title: "Recovery & Wellness", desc: "Rejuvenate with post-treatment care and Ayurvedic therapies.", icon: "04" },
                            { title: "Aftercare Support", desc: "Continuous follow-up and online consultations even after you return home.", icon: "05" }
                        ].map((step, i) => (
                            <div key={i} className={`relative flex items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-slate-50 z-10">
                                    {step.icon}
                                </div>
                                <div className={`ml-16 md:ml-0 w-full md:w-1/2 ${i % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
                                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                            <p className="text-slate-600">{step.desc}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Your Healing Journey in <span className="text-teal-600">Pictures</span></h2>
                        <p className="text-slate-600 text-lg">A glimpse into the serene facilities and natural beauty awaiting you.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px]">
                        {[
                            "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop"
                        ].map((img, i) => (
                            <div key={i} className={`rounded-2xl overflow-hidden group ${i === 0 || i === 3 ? 'md:col-span-2' : ''}`}>
                                <img
                                    src={img}
                                    alt={`Gallery image ${i + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?q=80&w=2000&auto=format&fit=crop"
                        alt="Kerala Sunset"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-teal-900/80 mix-blend-multiply"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to take the first step <br /> towards better health?</h2>
                    <p className="text-teal-100 text-xl mb-10 max-w-2xl mx-auto">Get a free consultation with our medical experts and let us design your perfect healing journey.</p>
                    <Button size="lg" className="bg-white text-teal-900 hover:bg-slate-100 rounded-full px-10 py-6 text-lg font-bold">
                        Schedule Free Consultation
                    </Button>
                </div>
            </section>
        </div>
    );
}
