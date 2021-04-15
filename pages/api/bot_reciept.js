import {handle} from "./handler";

export default async (req, res) => {

    let {oid, amount, email, phone} = req.query
    const site_link = "https://yumecs.uz/redirect_to_bot/"
    await handle(oid, amount, email, phone, res, site_link)

}