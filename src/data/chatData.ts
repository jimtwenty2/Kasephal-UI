export type ChatStatus = "active" | "archived" | "non-active";

export type Message = {
    id: number;
    sender: "me" | "other";
    text?: string;
    time: string;
    file?: {
        name: string;
        size: string;
    };
};

export type CropDetail = {
    cropName: string;
    quantity: string;
    status: string;
    price: string;
};

export type Chat = {
    id: number;
    name: string;
    location: string;
    avatar: string;
    preview: string;
    time: string;
    chatStatus: ChatStatus;
    unread?: number;
    online?: boolean;
    crop: CropDetail;
    messages: Message[];
};

export const chats: Chat[] = [
    {
        id: 1,
        name: "Chhim PoJim",
        location: "Kampong Cham",
        avatar: "/assets/chat-img/user1.png",
        preview: "We can deliver the Yellow Corn order tomorrow morning.",
        time: "10:45 AM",
        chatStatus: "non-active",
        unread: 2,

        crop: {
            cropName: "Yellow Corn",
            quantity: "250 Tons",
            status: "Available",
            price: "$850 / Ton",
        },

        messages: [

            {
                id: 1,
                sender: "me",
                text: "Hello, we can deliver the Yellow Corn order tomorrow morning. The full 250 tons is already prepared at our warehouse in Kampong Cham.",
                time: "10:30 AM",
            },
            {
                id: 2,
                sender: "other",
                text: "Great. Please confirm the truck schedule and make sure the corn is packed properly before loading for transportation.",
                time: "10:20 AM",
            },
            {
                id: 3,
                sender: "me",
                text: "Sure, I will send the delivery schedule together with the warehouse loading details before this evening.",
                time: "10:45 AM",
            },
        ],
    },

    {
        id: 2,
        name: "Horn Iola",
        location: "Battambang",
        avatar: "/assets/chat-img/user2.jpg",
        preview: "Are the moisture levels acceptable?",
        time: "Yesterday",
        chatStatus: "archived",

        crop: {
            cropName: "Corn",
            quantity: "5 Tons",
            status: "Pending",
            price: "$400 / Ton",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "Are the moisture levels acceptable for this Corn batch? We need to confirm the quality before moving forward with the order.",
                time: "02:10 PM",
            },
            {
                id: 2,
                sender: "me",
                text: "The current moisture level is acceptable and still within export standards. I will send the inspection report for your review.",
                time: "02:18 PM",
            },
            {
                id: 3,
                sender: "me",
                file: {
                    name: "corn-inspection-report.pdf",
                    size: "2.4 MB",
                },
                time: "02:25 PM",
            },
            {
                id: 4,
                sender: "other",
                text: "Thank you. Once our quality assurance team finishes reviewing the report, we will confirm the final purchasing process.",
                time: "02:40 PM",
            },
        ],
    },

    {
        id: 3,
        name: "Mekong Logistics",
        location: "Phnom Penh",
        avatar: "/assets/chat-img/user3.jpg",
        preview: "Logistics quote attached.",
        time: "Mon",
        chatStatus: "active",
        online: true,

        crop: {
            cropName: "Transportation",
            quantity: "3 Trucks",
            status: "Available",
            price: "$250 / Trip",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "We prepared the logistics quote for 3 trucks from Phnom Penh. The price includes transportation, loading support, and fuel costs.",
                time: "08:15 AM",
            },
            {
                id: 2,
                sender: "other",
                file: {
                    name: "transportation-quote.pdf",
                    size: "1.8 MB",
                },
                time: "08:17 AM",
            },
            {
                id: 3,
                sender: "me",
                text: "Thanks for sending the quotation. I will review the delivery schedule and confirm with our buyer later today.",
                time: "08:30 AM",
            },
            {
                id: 4,
                sender: "other",
                text: "Perfect. Please let us know if there are any changes to the delivery route or transportation timeline.",
                time: "08:38 AM",
            },
        ],
    },

    {
        id: 4,
        name: "Put Sovannary",
        location: "Phnom Penh",
        avatar: "/assets/chat-img/user4.jpg",
        preview: "Can you reserve the rice stock for this week?",
        time: "Mon",
        chatStatus: "active",
        online: true,

        crop: {
            cropName: "Jasmine Rice",
            quantity: "80 Tons",
            status: "Reserved",
            price: "$920 / Ton",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "Can you reserve the Jasmine Rice stock until Friday? Our finance department still needs approval before confirming payment.",
                time: "11:00 AM",
            },
            {
                id: 2,
                sender: "me",
                text: "Yes, we can temporarily reserve the 80 tons for your company. However, we may require a deposit before extending the reservation period.",
                time: "11:08 AM",
            },
            {
                id: 3,
                sender: "other",
                text: "Understood. I will discuss the deposit arrangement with our management team and update you again tomorrow morning.",
                time: "11:15 AM",
            },
            {
                id: 4,
                sender: "me",
                text: "No problem. Once we receive confirmation from your side, we will prepare the warehouse and export documentation immediately.",
                time: "11:22 AM",
            },
        ],
    },

    {
        id: 5,
        name: "Rottany Khorn",
        location: "Phnom Penh",
        avatar: "/assets/chat-img/user5.jpg",
        preview: "Please review the contract before signing.",
        time: "Mon",
        chatStatus: "active",
        online: true,

        crop: {
            cropName: "Cassava",
            quantity: "120 Tons",
            status: "Negotiating",
            price: "$310 / Ton",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "Please review the updated contract draft.",
                time: "03:20 PM",
            },
            {
                id: 2,
                sender: "other",
                file: {
                    name: "cassava-contract.pdf",
                    size: "3.1 MB",
                },
                time: "03:22 PM",
            },
            {
                id: 3,
                sender: "me",
                text: "I’ll check the agreement and reply shortly.",
                time: "03:30 PM",
            },
        ],
    },

    {
        id: 6,
        name: "Sok Dara",
        location: "Takeo",
        avatar: "/assets/chat-img/user6.jpg",
        preview: "We need confirmation before loading the trucks.",
        time: "8:20 AM",
        chatStatus: "active",
        online: true,

        crop: {
            cropName: "Cassava",
            quantity: "90 Tons",
            status: "Negotiating",
            price: "$320 / Ton",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "Before we start loading the trucks tomorrow morning, we need final confirmation for the total quantity and destination warehouse.",
                time: "08:10 AM",
            },
            {
                id: 2,
                sender: "me",
                text: "The quantity remains 90 tons and delivery will go to Phnom Penh central warehouse as discussed previously.",
                time: "08:18 AM",
            },
            {
                id: 3,
                sender: "other",
                text: "Understood. Our logistics team will prepare the transport documents and arrival schedule tonight.",
                time: "08:20 AM",
            },
        ],
    },

    {
        id: 7,
        name: "Golden Rice Export",
        location: "Battambang",
        avatar: "/assets/chat-img/user7.jpg",
        preview: "The inspection report has been approved.",
        time: "Yesterday",
        chatStatus: "non-active",

        crop: {
            cropName: "Premium Rice",
            quantity: "180 Tons",
            status: "Approved",
            price: "$940 / Ton",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "The inspection report for the rice shipment has been reviewed by our quality assurance department and everything meets export standards.",
                time: "04:20 PM",
            },
            {
                id: 2,
                sender: "me",
                text: "That’s great news. We will begin preparing the packaging and export documentation immediately.",
                time: "04:32 PM",
            },
            {
                id: 3,
                sender: "other",
                file: {
                    name: "rice-inspection-report.pdf",
                    size: "3.8 MB",
                },
                time: "04:35 PM",
            },
        ],
    },

    {
        id: 8,
        name: "Vanna Trading",
        location: "Siem Reap",
        avatar: "/assets/chat-img/user8.jpg",
        preview: "Can you reduce the price slightly?",
        time: "Tue",
        chatStatus: "non-active",

        crop: {
            cropName: "Mango",
            quantity: "40 Tons",
            status: "Pending",
            price: "$510 / Ton",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "We reviewed the current market pricing this week and would like to know if there is any possibility for a small reduction in the final price.",
                time: "01:10 PM",
            },
            {
                id: 2,
                sender: "me",
                text: "We can offer a discount if the order quantity increases beyond 50 tons and payment is completed before shipment.",
                time: "01:25 PM",
            },
            {
                id: 3,
                sender: "other",
                text: "I will discuss the updated terms with management and confirm the final quantity tomorrow morning.",
                time: "01:40 PM",
            },
        ],
    },

    {
        id: 9,
        name: "Agro Supply Co.",
        location: "Kandal",
        avatar: "/assets/chat-img/user9.jpg",
        preview: "Please review the transportation agreement.",
        time: "Wed",
        chatStatus: "archived",

        crop: {
            cropName: "Transportation",
            quantity: "5 Trucks",
            status: "Completed",
            price: "$280 / Trip",
        },

        messages: [
            {
                id: 1,
                sender: "other",
                text: "Attached is the updated transportation agreement including fuel costs, unloading fees and the revised delivery schedule.",
                time: "10:05 AM",
            },
            {
                id: 2,
                sender: "other",
                file: {
                    name: "transportation-agreement.pdf",
                    size: "2.7 MB",
                },
                time: "10:06 AM",
            },
            {
                id: 3,
                sender: "me",
                text: "I have reviewed the agreement carefully and the transportation terms look acceptable from our side.",
                time: "10:22 AM",
            },
            {
                id: 4,
                sender: "other",
                text: "Excellent. We will proceed with scheduling the drivers and preparing the warehouse loading team.",
                time: "10:30 AM",
            },
        ],
    },
];