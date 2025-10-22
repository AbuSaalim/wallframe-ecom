import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";


export async function PUT(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validationSchema = LoginSchema.pick({
            email:true,password:true
        })

        const validationData = validationSchema.safeParse(payload)
        if (!validationData.success) {
            return response(false, 401, 'Invalid or missing input feild.', validationData.error)
        }

        const {email, password} = validationData.data
        const getUser = await UserModel.findOne({deletedAt: null, email}).select("+password")

        if (!getUser) {
            return response(false, 404, 'User not found.')
        }

        getUser.password = password
        await getUser.save()

        return response(true,200,'Password Updated Success.')

    } catch (error) {
        catchError(error)
    }
    
}