import { DataTable } from '@/components/DataTable'
import { columns } from './columns'
import { getAnimals } from '@/lib/data'

export default async function Home() {
  const animals = await getAnimals()
  
  return (
    <main className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-green-800 mb-8">
        Masclet Imperi
      </h1>
      <DataTable columns={columns} data={animals} />
    </main>
  )
}