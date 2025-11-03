import { db } from './src/client'

async function main() {
  try {
    console.log('📊 CURRENT DATABASE PROPERTIES:\n')

    const properties = await db.property.findMany({
      select: {
        id: true,
        title: true,
        city: true,
        latitude: true,
        longitude: true,
        price: true,
      },
      orderBy: { city: 'asc' }
    })

    console.log(`Total: ${properties.length} properties\n`)

    // Group by city
    const byCity = properties.reduce((acc, p) => {
      if (!acc[p.city]) acc[p.city] = []
      acc[p.city].push(p)
      return acc
    }, {} as Record<string, typeof properties>)

    Object.entries(byCity).forEach(([city, props]) => {
      console.log(`${city}: ${props.length} properties`)
      props.forEach(p => {
        console.log(`  • ${p.title} ($${Number(p.price)}) @ (${Number(p.latitude)}, ${Number(p.longitude)})`)
      })
      console.log()
    })

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
