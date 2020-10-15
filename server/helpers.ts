import mongoose from 'mongoose'
const validId = (id: string): Promise<null> => {

  return new Promise<null>((resolve, reject) => {
    if (mongoose.Types.ObjectId.isValid(id)) resolve()
    else reject()
  });

}

export { validId }