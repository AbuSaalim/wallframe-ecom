import { connectDB } from "@/lib/detabaseConnection";
import { catchError, isAuthenticated, response } from "@/lib/helperFunction";
import { LoginSchema } from "@/lib/zodSchema";
import CategoryModel from "@/models/Category.model";

export async function POST(request) {
    try {
         // Check authentication
            const auth = await isAuthenticated('admin');
            if (!auth.isAuth) {
              return response(false, 403, 'Unauthorized.');
            }

            await connectDB()
            const payload = await request.json();


              const schema = LoginSchema.pick({
                name: true,
                slug: true
              });

              const validate = schema.safeParse(payload)

              if (!validate.success) {
                return response(false, 400, 'Invalid or missing feild', validate.error)
              }

              const {name, slug} = validate.data


              const newCategory = new CategoryModel({
                name,slug
              })

              return response(true, 200, 'category added successfully')



    } catch (error) {
        return catchError(error)
    }
}