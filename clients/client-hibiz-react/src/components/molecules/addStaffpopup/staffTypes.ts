
export type AddRoleArrayType = {
    role: string;
    description: string;
}

export const AddRoleArray = [
    {
        role: "Co-Owner",
        description: "Has the ability to access of Hi-Biz and Hi Table. Can view sales and make orders too.",
    },
    {
        role: "Manager",
        description: "Has limited access to HiBiz and complete access of Hitables. Has access to discounts in Hi-Tables"
    },
    {
        role: "Marketing Agent",
        description: "Has limited access to Hi-biz. To change the look and feel of the Menu. Access to Menu manager."
    }, {
        role: "Captain",
        description: "Has complete access to Hitable and can turn on and off dishes"
    }
] as AddRoleArrayType[];

export type servicePermissionsArrayType = {
    title: string;
    description: string
}

export type permissionsArrayType = {
    permission: string;
    services: servicePermissionsArrayType[]
}

export const permissionsArray = [
    {
        permission: "Hi Biz",
        services: [
            {
                title: "Items",
                description: "Can add or delete Items"
            }, 
            {
                title: "Menu Manager and explore page",
                description: "Can edit the look of items in menu like images and description."
            },
            {
                title:"Edit Staff",
                description:"Will be able to add or delete Staff"
            },
            {
                title:"View Staff",
                description:"Will be able to view Staff"
            }
        ]
    },
    {
        permission: "Hi Tables",
        services: [
            {
                title: "Reject Payments",
                description: "Can reject the payments"
            },
            {
                title: "Quick Menu",
                description: " Can Turn on anf off the dishes for digital Menu "
            },
        ]
    },
    {
        permission: "Hi Biz",
        services: [
            {
                title: "Items",
                description: "Can add or delete Items"
            }, 
            {
                title: "Menu Manager and explore page",
                description: "Can edit the look of items in menu like images and description."
            },
            {
                title:"Edit Staff",
                description:"Will be able to add or delete Staff"
            },
            {
                title:"View Staff",
                description:"Will be able to view Staff"
            }
        ]
    },
    {
        permission: "Hi Tables",
        services: [
            {
                title: "Reject Payments",
                description: "Can reject the payments"
            },
            {
                title: "Quick Menu",
                description: " Can Turn on anf off the dishes for digital Menu "
            },
        ]
    },
    

] as permissionsArrayType[];