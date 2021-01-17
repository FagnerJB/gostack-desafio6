import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateOrFindCategoryService from './CreateCategory'

interface Request {
   title: string
   value: number
   type: "income" | "outcome"
   category: string
}

class CreateTransactionService {
   public async execute({ title, value, type, category }: Request): Promise<Transaction> {

      const transactionsRepository = getCustomRepository(TransactionsRepository)

      if (!title && !value && !type && !category)
         throw new AppError("Informe os campos necessários", 401)

      if (type !== "income" && type !== "outcome")
         throw new AppError("Tipo inválido", 401)

      const balance = await transactionsRepository.getBalance()

      if (balance.total < value && type === 'outcome')
         throw new AppError("Saldo inválido", 400)

      const categoryService = new CreateOrFindCategoryService()
      const categoryObj = await categoryService.execute({ category })

      const transaction = transactionsRepository.create({
         title,
         value,
         type,
         category: categoryObj,
      })

      await transactionsRepository.save(transaction)

      return transaction
   }
}

export default CreateTransactionService;
