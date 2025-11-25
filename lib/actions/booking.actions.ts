
import connectDB from "../mongodb";
import Booking from "@/database/booking.model";

export const createBooking =  async ({eventId , slug , email} : {eventId : string ; slug : string ; email : string}) => {
    try {
        await connectDB();
        const booking = (await Booking.create({ eventId , slug , email })).lean();

        // to return plain js instead of json , we used .lean method to convert json document in to plain js , 
        // other wise we use JSON.parse to convert it onto plain js.

        return {success : true , booking}
    } catch (e) {
        console.error("Error occured",e);
        return {success : false ,error : e };
    }
}