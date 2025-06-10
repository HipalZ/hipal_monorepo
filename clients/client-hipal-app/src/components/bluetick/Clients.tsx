'use client';

import Image from 'next/image';
import client from '@/assets/client.png';

const Clients = () => {
  return (
    <div>
      <section>
        <h1>What our clients say</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione minus neque, aliquam
          doloribus sapiente labore suscipit aspernatur mollitia id rerum expedita quia tempora quos
          commodi hic eos ut reiciendis quis.
        </p>
      </section>
      <section>
        <Image src={client} alt="client1" width={400} height={400} priority />
      </section>
    </div>
  );
};

export default Clients;
