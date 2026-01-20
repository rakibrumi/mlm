import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.min.css'
import SwiperCore, { Pagination, Navigation, Autoplay } from 'swiper'
import Image from 'next/image'

const images = [
  {
    src: '/static/product/n.jpg',
    title: 'Product One',
    details: 'Details for Product One',
  },
  {
    src: '/static/m/one.jpg',
    title: 'Product One',
    details: 'Details for Product One',
  },
  {
    src: '/static/m/two.jpg',
    title: 'Product One',
    details: 'Details for Product One',
  },
  {
    src: '/static/product/cleaner.jpg',
    title: 'Product One',
    details: 'Details for Product One',
  },
  {
    src: '/static/product/ata.jpg',
    title: 'Product Two',
    details: 'Details for Product Two',
  },
  {
    src: '/static/product/caul.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
  {
    src: '/static/product/daul.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
  {
    src: '/static/product/dishWashing.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
  {
    src: '/static/product/holud.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
  {
    src: '/static/product/oil.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
  {
    src: '/static/product/semai.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
  {
    src: '/static/product/serf.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
  {
    src: '/static/product/sugar.jpg',
    title: 'Product Three',
    details: 'Details for Product Three',
  },
]

SwiperCore.use([Pagination, Navigation, Autoplay])

const HeroSlider = () => {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={10}
      loop={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      style={{
        borderRadius: '0.5rem',
        borde: '4px solid black',
      }}
    >
      {images.map((item, index) => (
        <SwiperSlide
          key={index}
          className="swiper-slide flex flex-col justify-center items-center"
        >
          <div className="relative h-[250px] w-2/3 overflow-hidden border-black border-4 rounded-lg">
            <Image
              src={item.src}
              alt={`product-${index}`}
              layout="fill"
              objectFit="cover"
              className="mx-auto"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default HeroSlider
