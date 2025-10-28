import { connectDB } from "@/lib/detabaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        await connectDB()
        const cookiesStore = await cookies()
        cookiesStore.delete('access_token')
        return response(true,200,'Logout successfull.')
    } catch (error) {
        catchError(error)
    }
    
}