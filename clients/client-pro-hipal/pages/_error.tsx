import { BiDish } from 'react-icons/bi'

export default function Error({ statusCode }: { statusCode: string }) {
	return (
		<div className='flex flex-row w-screen min-h-screen space-y-6 text-center'>
			<div className='flex flex-col pb-12 m-auto space-y-2 prose'>
				<BiDish className='mx-auto text-6xl' />

				<h6 className='my-0'>Unable to find your test.</h6>
				<small className='my-0'>Please scan your qr code again.</small>
				<p className='bg-red-500/20 border-2 border-red-500 rounded-lg px-2 py-0.5 mx-auto mt-4'>
					{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
				</p>
			</div>
		</div>
	)
}

Error.getInitialProps = ({
	res,
	err,
}: {
	res: {
		statusCode: string
	}
	err: {
		statusCode: string
	}
}) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404
	return { statusCode }
}
