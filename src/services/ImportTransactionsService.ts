import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { In, getRepository, getCustomRepository } from 'typeorm';

import Category from '../models/Category'
import Transaction from '../models/Transaction'
import TransactionsRepository from '../repositories/TransactionsRepository'

interface transactionI {
   title: string,
   type: 'income' | 'outcome'
   value: number
   category: string
}

class ImportTransactionsService {
   public async execute(fileCsv: string): Promise<Transaction[]> {

      const categoriesRepository = getRepository(Category)
      const transactionsRepository = getCustomRepository(TransactionsRepository)

      const gotCategories = [] as string[]
      const gotTransactions = [] as transactionI[]
      const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', fileCsv)

      await new Promise((resolve) => {

         fs.createReadStream(csvFilePath)
            .pipe(csvParse({
               from_line: 2,
               ltrim: true,
               rtrim: true,
            }))
            .on('data', async line => {
               const [title, type, value, category] = line

               gotCategories.push(category)
               gotTransactions.push({ title, type, value, category })

            })
            .on('end', resolve)

      })

      const dbCategories = await categoriesRepository.find({
         where: {
            title: In(gotCategories)
         }
      })

      const dbCategoriesTitles = dbCategories.map((category: Category) => category.title)

      const newCategoriesTitles = gotCategories.filter((category) => !dbCategoriesTitles.includes(category)).filter((value, index, self) => self.indexOf(value) === index)

      const newCategories = categoriesRepository.create(
         newCategoriesTitles.map(category => ({ title: category }))
      )

      await categoriesRepository.save(newCategories)

      const allCategories = [...dbCategories, ...newCategories]

      const transactions = transactionsRepository.create(
         gotTransactions.map(transaction => ({
            title: transaction.title,
            value: transaction.value,
            type: transaction.type,
            category: allCategories.find(category => transaction.category === category.title)
         }))
      )

      await transactionsRepository.save(transactions)

      return transactions
   }
}

export default ImportTransactionsService;
