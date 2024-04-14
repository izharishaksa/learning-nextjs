import {sql} from '@vercel/postgres';
import {
    CustomerField,
    CustomersTableType,
    InvoiceForm,
    InvoicesTable,
    LatestInvoiceRaw,
    User,
    Revenue,
    LatestInvoice,
} from './definitions';
import {formatCurrency} from './utils';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';

export async function fetchRevenue() {
    // Add noStore() here to prevent the response from being cached.
    // This is equivalent to in fetch(..., {cache: 'no-store'}).

    try {
        // console.log('Fetching revenue data...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // console.log('Data fetch completed after 3 seconds.');

        let data: Revenue[] = [
            {
                revenue: 1000,
                month: 'January',
            },
            {
                revenue: 2000,
                month: 'February',
            },
            {
                revenue: 3000,
                month: 'March',
            },
            {
                revenue: 4000,
                month: 'April',
            },
            {
                revenue: 5000,
                month: 'May',
            },
            {
                revenue: 6000,
                month: 'June',
            },
        ];

        return data;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch revenue data.');
    }
}

export async function fetchLatestInvoices() {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        let data: LatestInvoice[] = [
            {
                amount: '1000',
                email: 'izharishaksa@gmail.com',
                id: '1',
                name: 'John Doe',
                image_url: '/customers/amy-burns.png',
            },
            {
                amount: '1000',
                email: 'izharishaksa@gmail.com',
                id: '2',
                name: 'John Doe',
                image_url: '/customers/amy-burns.png',
            },
            {
                amount: '1000',
                email: 'izharishaksa@gmail.com',
                id: '3',
                name: 'John Doe',
                image_url: '/customers/amy-burns.png',
            },
        ];

        return data;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the latest invoices.');
    }
}

export async function fetchCardData() {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const numberOfInvoices = Number(20);
        const numberOfCustomers = Number(13);
        const totalPaidInvoices = formatCurrency(131500);
        const totalPendingInvoices = formatCurrency(111400);

        return {
            numberOfCustomers,
            numberOfInvoices,
            totalPaidInvoices,
            totalPendingInvoices,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch card data.');
    }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
    query: string,
    currentPage: number,
) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const endIndex = Math.min(offset + ITEMS_PER_PAGE, invoicesTables.length);
        return invoicesTables.slice(offset, endIndex);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoices.');
    }
}

export async function fetchInvoicesPages(query: string) {
    try {
        return invoicesTables.length / ITEMS_PER_PAGE;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchInvoiceById(id: string) {
    try {
        const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

        const invoice = data.rows.map((invoice) => ({
            ...invoice,
            // Convert amount from cents to dollars
            amount: invoice.amount / 100,
        }));

        return invoice[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoice.');
    }
}

export async function fetchCustomers() {
    try {
        const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

        const customers = data.rows;
        return customers;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all customers.');
    }
}

export async function fetchFilteredCustomers(query: string) {
    try {
        const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

        const customers = data.rows.map((customer) => ({
            ...customer,
            total_pending: formatCurrency(customer.total_pending),
            total_paid: formatCurrency(customer.total_paid),
        }));

        return customers;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch customer table.');
    }
}

export async function getUser(email: string) {
    try {
        const user = await sql`SELECT * FROM users WHERE email=${email}`;
        return user.rows[0] as User;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

const invoicesTables: InvoicesTable[] = [
    {
        amount: 1000,
        email: 'izharishaksa@gmail.com',
        id: '1',
        name: 'John Doe',
        image_url: '/customers/amy-burns.png',
        date: '2021-08-01',
        status: 'paid',
        customer_id: '1',
    },
    {
        amount: 2500,
        email: 'example1@gmail.com',
        id: '2',
        name: 'Jane Doe',
        image_url: '/customers/balazs-orban.png',
        date: '2022-01-15',
        status: 'pending',
        customer_id: '2',
    },
    {
        amount: 1300,
        email: 'example2@gmail.com',
        id: '3',
        name: 'Jim Beam',
        image_url: '/customers/delba-de-oliveira.png',
        date: '2022-05-20',
        status: 'paid',
        customer_id: '3',
    },
    {
        amount: 500,
        email: 'example3@gmail.com',
        id: '4',
        name: 'Jenny Smith',
        image_url: '/customers/amy-burns.png',
        date: '2022-08-09',
        status: 'pending',
        customer_id: '4',
    },
    {
        amount: 800,
        email: 'example4@gmail.com',
        id: '5',
        name: 'Jack Ripper',
        image_url: '/customers/balazs-orban.png',
        date: '2023-02-11',
        status: 'paid',
        customer_id: '5',
    },
    {
        amount: 1600,
        email: 'example5@gmail.com',
        id: '6',
        name: 'Julie Reeds',
        image_url: '/customers/delba-de-oliveira.png',
        date: '2023-03-18',
        status: 'pending',
        customer_id: '6',
    },
    {
        amount: 2400,
        email: 'example6@gmail.com',
        id: '7',
        name: 'Joe Walsh',
        image_url: '/customers/amy-burns.png',
        date: '2023-04-25',
        status: 'paid',
        customer_id: '7',
    },
    {
        amount: 950,
        email: 'example7@gmail.com',
        id: '8',
        name: 'Jessica Rabbit',
        image_url: '/customers/balazs-orban.png',
        date: '2023-05-30',
        status: 'pending',
        customer_id: '8',
    },
    {
        amount: 1200,
        email: 'example8@gmail.com',
        id: '9',
        name: 'James Bond',
        image_url: '/customers/delba-de-oliveira.png',
        date: '2023-07-22',
        status: 'paid',
        customer_id: '9',
    },
    {
        amount: 750,
        email: 'example9@gmail.com',
        id: '10',
        name: 'Janice Joplin',
        image_url: '/customers/amy-burns.png',
        date: '2023-09-15',
        status: 'pending',
        customer_id: '10',
    },
    {
        amount: 2200,
        email: 'example10@gmail.com',
        id: '11',
        name: 'Johnny Cash',
        image_url: '/customers/balazs-orban.png',
        date: '2023-11-05',
        status: 'paid',
        customer_id: '11',
    },
    {
        amount: 1450,
        email: 'example11@gmail.com',
        id: '12',
        name: 'Julia Roberts',
        image_url: '/customers/delba-de-oliveira.png',
        date: '2024-01-10',
        status: 'pending',
        customer_id: '12',
    },
];
