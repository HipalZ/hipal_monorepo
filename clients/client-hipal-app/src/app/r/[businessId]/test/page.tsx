import React from 'react';

const fetchGreeting = async () => {
    console.log('Fetching greeting at:', new Date().toISOString());
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        next: { revalidate: 10 }, // Revalidate the data every 10 seconds
    });
    const data = await res.json();
    return data[0].title;
};

const TestPage = async ({ params }: { params: { businessId: string } }) => {
    const greeting = await fetchGreeting();
    console.log('greeting:', greeting)
    return (
        <div>
            <h1>Greeting from the server:</h1>
            <p>{greeting}</p>
            <p>Business ID: {params.businessId}</p>
        </div>
    );
};

export default TestPage;
