import { getRepository } from 'typeorm'
import Category from '../models/Category'

interface Request {
   category: string
}

class CreateOrFindCategoryService {
   public async execute({ category }: Request): Promise<Category> {
      const categoryRepository = getRepository(Category)

      const findCategory = await categoryRepository.findOne({
         where: { title: category }
      })

      if (findCategory)
         return findCategory

      const newCategory = categoryRepository.create({
         title: category
      })

      await categoryRepository.save(newCategory)

      return newCategory
   }
}

export default CreateOrFindCategoryService
