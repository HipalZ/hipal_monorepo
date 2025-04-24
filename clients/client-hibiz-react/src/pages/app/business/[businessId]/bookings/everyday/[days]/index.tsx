import { useParams } from 'react-router-dom'

const IndividualDay = () => {
    const params = useParams()
    const { businessId, days } = params
    console.log(businessId, days)
  return (
    <div>
      
    </div>
  )
}

export default IndividualDay
