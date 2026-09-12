import { UploadApiResponse } from "cloudinary";
import { cloudinry } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
	
    const currentUser = await prisma.user.findUnique({
        where:{
            id: userId
        },
        select:{
            imagePublicId: true
        }
    })
    const cloudinaryResult = await new Promise<UploadApiResponse>((resolve, reject) => {
		cloudinry.uploader
			.upload_stream(
				{
					resource_type: "auto",
				},
				async (error, result) => {
					if (error) {
						return reject(error);
					}

                    if(!result){
                        return reject(new Error("No result returned from cloudinary"))
                    }

					resolve(result);
				},
			)
			.end(buffer);
	});
	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			profileImage: cloudinaryResult.secure_url,
			imagePublicId: cloudinaryResult.public_id,
		},
		omit: {
			password: true,
		},
	});

    if(currentUser?.imagePublicId){
        await cloudinry.uploader.destroy(currentUser.imagePublicId)
    }

	return updatedUser;
};

export const UserServices = {
	uploadProfileImage,
};
