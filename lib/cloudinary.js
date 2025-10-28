import {v2 as claudinary} from 'claudinary'

claudinary.config({
    cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key:process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY,
})