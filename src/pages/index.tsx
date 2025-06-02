import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from "@/components/Header/Header";
import 'bootstrap/dist/css/bootstrap.min.css';
import heroAnimation from '@/assets/animation/learning-online.json';
import Footer from '@/components/Footer/Footer';
import AIimag from "@/assets/png/AI.png"
import Leadershipimag from "@/assets/png/Leadership.png"
import Innovationimag from "@/assets/png/Innovation.png"
import Strategyimag from "@/assets/png/Strategy.png"
import PersonalFinanceimag from "@/assets/png/Person-finance.png"
import Sellingimag from "@/assets/png/Selling.png"
import Communicationimag from "@/assets/png/Communication.png"
import Image from 'next/image';
import BD1 from "@/assets/png/Bd-1.png";
import BD2 from "@/assets/png/Bd-2.png";
import BD3 from "@/assets/png/Bd-3.png";
import BD4 from "@/assets/png/Bd-4.png";
import BD5 from "@/assets/png/Bd-5.png";
import BD6 from "@/assets/png/Bd-6.png";
import BD7 from "@/assets/png/Bd-7.png";
import BD8 from "@/assets/png/Bd-8.png";
import ProductCarousel from "@/components/Trainerslider/ProductCarousel"
import ClientLogoSlider from '@/components/Clientslider/ClientLogoSlider';
import AppDownloadSection from '@/components/Appdownload/Appdownload';
import PopularCourse from '@/components/PopularCourse/PopularCourse';
import ExploreCourse from '@/components/ExploreCourese/ExploreCourse';
import Link from 'next/link';



const Lottie = dynamic(() => import('lottie-react'), { ssr: false });



// Categories
const Categories = () => {
  return (
    <>
      <main className="container my-5">
        {/* Container for both Title and See more */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -25 }}>
          {/* Title Section */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="popular-posts-line" style={{height: 35, borderRadius: 50}}></div>
            <h1 className="mb-4" style={{ fontSize: 25, letterSpacing: "1px", color: "#2c3e50", marginTop: 25 }}>
              Course Categories
            </h1>
          </div>
        </div>

        {/* First row with 5 columns */}
        <div className="row mb-4">
          <div className="col-6 col-md-4 col-lg mb-3" style={{backgroundColor: "transparent"}}>
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent" }}>
              {/* Image on Top */}
              <Image
                src={AIimag}  // Your image source
                alt="Category 1"
                width={200}
                height={200}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20, letterSpacing: "1px"}}>AI</h2>
                <a href="ai" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px" }}>View</a>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={Leadershipimag}  // Your image source
                alt="Category 1"
                width={200}
                height={200}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20, letterSpacing: "1px"}}>Leadership</h2>
                <a href="leadership" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px" }}>View</a>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={Innovationimag}  // Your image source
                alt="Category 1"
                width={200}
                height={200}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20, letterSpacing: "1px"}}>Innovation</h2>
                <a href="innovation" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px" }}>View</a>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={Strategyimag}  // Your image source
                alt="Category 1"
                width={200}
                height={200}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20, letterSpacing: "1px"}}>Strategy</h2>
                <a href="strategy" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px" }}>View</a>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={PersonalFinanceimag}  // Your image source
                alt="Category 1"
                width={200}
                height={200}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20, letterSpacing: "1px"}}>Personal Finance</h2>
                <a href="finance" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px" }}>View</a>
              </div>
            </div>
          </div>
        </div>

        {/* Second row with 4 columns */}
        <div className="row">
          <div className="col-6 col-md-4 col-lg mb-3">
            {/* Nothing */}
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={Sellingimag}  // Your image source
                alt="Category 1"
                width={200}
                height={200}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20, letterSpacing: "1px"}}>Selling</h2>
                <a href="selling" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px" }}>View</a>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={Communicationimag}  // Your image source
                alt="Category 1"
                width={200}
                height={200}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20, letterSpacing: "1px"}}>Communication</h2>
                <a href="communication" className="btn search-btn" style={{ paddingLeft: 50, paddingRight: 50, fontFamily: "'Livvic', sans-serif", fontSize: "16px", letterSpacing: "1px" }}>View</a>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            {/* Nothing */}
          </div>
        </div>
      </main>

      <style jsx>{`
        .card {
          height: 100%;
          min-height: 200px;
        }
      `}</style>
    </>
  );
};


// Board of Director
const Bodofdirector = () => {
  return (
    <>
      <main className="container my-5">
        {/* Container for both Title and See more */}
        <div style={{ display: "flex", alignItems: "center", marginTop: -25 }}>
          {/* Title Section */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 25, paddingBottom: 20 }}>
            <h1 className="mb-4" style={{ fontSize: 25, letterSpacing: "1px", color: "#2c3e50", marginTop: 25, textAlign: "center" }}>
              Board of Directors
            </h1>
          </div>
        </div>

        {/* Second row with 4 columns */}
        <div className="row">
          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD1}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Mr. Chim Guanghui</h2>
                <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Chairman</h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD8}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Mr. Hin Sopheap</h2>
                <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Executive Director Member</h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD7}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Ms. Khov Manil</h2>
                <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Member</h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD6}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Dr. Siam Monileak</h2>
                <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Member</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD5}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Dr. Somboon Mongkolsombat</h2>
                <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Member</h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD4}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Mr. Ngeth Chou</h2>
                <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Member</h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD3}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Mr. Ros Sokha</h2>
                <h2 style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Member</h2>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-lg mb-3">
            <div className="card h-100 border-0" style={{ justifyContent: "center", alignItems: "center",backgroundColor: "transparent"  }}>
              {/* Image on Top */}
              <Image
                src={BD2}  // Your image source
                alt="Category 1"
                width={250}
                height={250}
                className="card-img-top"
                style={{
                  objectFit: "cover",
                  width: "180px",
                  height: "205px",
                  borderRadius: 10,
                  justifyContent: "center",
                  margin: "0 auto"  // Center the image
                }}
              />

              <div className="card-body text-center">
                <h2 className="card-title" style={{color: "#2c3e50", fontFamily: "'Acme', sans-serif", fontSize: 20}}>Mr. Kheav Sambath Thunthean</h2>
                <h2 className='txt-sub' style={{ fontWeight: 400, color: "#2c3e50", fontFamily: "'Livvic', sans-serif", fontSize: 16 }}>Member</h2>
              </div>
            </div>
          </div>
        </div>

      </main>

      <style jsx>{`
        .card {
          height: 100%;
          min-height: 200px;
        }
        
      `}</style>
    </>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>DG Next</title>
        <meta name="description" content="Your modern learning management system" />
        <link rel="icon" href="/dglogo.ico" />
      </Head>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="text-white py-0" style={{ backgroundColor: "#F47834" }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
              <h1 className="display-4" style={{fontSize: 35}}>{`Enhancing people's capability in the age of AI`}</h1>


                <p className="lead">
                  Discover a world of knowledge with our comprehensive learning management system.
                </p>
                <Link href={"/courselist"}>
                <button className="btn btn-light btn-lg" style={{ color: "#2c3e50", fontFamily: "'Livvic', sans-serif" }}><small className="text-muted">Get Started Now!</small></button>
                </Link>
              </div>
              <div className="col-lg-6">
                <Lottie animationData={heroAnimation} className="img-fluid" style={{ paddingTop: 40 }} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Categories />

      <PopularCourse />

      <ExploreCourse />

      <Bodofdirector />

      <ProductCarousel />

      <ClientLogoSlider />

      <AppDownloadSection />

      <Footer />
    </>
  );
}
