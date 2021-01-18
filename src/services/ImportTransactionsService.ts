import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import CreateTransactionService from '../services/CreateTransactionService';

class ImportTransactionsService {
   async execute(fileCsv: string): Promise<Transaction[]> {

      const lines = [] as any[]
      const createTransaction = new CreateTransactionService()
      const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', fileCsv)

      await new Promise((resolve) => {

         fs.createReadStream(csvFilePath)
            .pipe(csvParse({
               from_line: 2,
               ltrim: true,
               rtrim: true,
            }))
            .on('data', (line) => lines.push(line))
            .on('end', resolve)

      })


      const transactions = lines.map(async (line) => {

         return await createTransaction.execute({
            title: line[0], type: line[1], value: line[2], category: line[3]
         })

      })

      return await Promise.all(transactions)
   }
}

export default ImportTransactionsService;
