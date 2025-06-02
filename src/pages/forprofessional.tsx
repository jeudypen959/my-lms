import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Head from "next/head";
import Image from "next/image";
import forprofessional from "@/assets/jpg/for-professionals.jpg";


export default function ForProfessional() {


    return (
        <>
            <Head>
                <title>DG Next - For Professionals</title>
                <link rel="icon" href="/dglogo.ico" />
            </Head>
            <Header />
            <div className="container text-center" style={{marginTop: 50, paddingBottom: 70}}>
                <Image
                    src={forprofessional}
                    alt="About Us Image"
                    width={500}
                    height={300}
                    className="img-fluid mt-3"
                    style={{paddingTop: 30}}
                />
                <h2 className="mt-4" style={{fontSize: 18, fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif"}}>
                    For Professionals

                    Fuel your future with engaging, relevant courses that help you excel academically and beyond. <br/> Our platform is intuitive and packed with resources to keep you motivated. <br/>
                    Exclusive Student Discounts: We believe that cost should never be a barrier to quality learning. <br/> Reach out for your special rate and begin your journey with confidence! <br/>
                    Contact us at contact@dgdemy.org

                    Telegram: 010 801 601  , Tel: 010 801 601/099 200 805
                </h2>
            </div>


            <Footer />
        </>
    )
}