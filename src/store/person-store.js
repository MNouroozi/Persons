import { writable } from 'svelte/store';
export const PersonsData = writable([
    {
        id: 0,
        firstName: "مهرداد",
        lastName: "نوروزمکاری",
        phone: "09177043608",
        provider: "پتروشیمی",
        city: "شیراز",
        picture: "./avator.png",
        visible:true
    },
    {
        id: 1,
        firstName: "ایمان",
        lastName: "مردانی",
        phone: "091208043605",
        provider: "پارس جنوبی",
        city: "عسلویه",
        picture: "./avator.png",
        visible:true
    },
    {
        id: 2,
        firstName: "حسن",
        lastName: "محمدی",
        phone: "09177043608",
        provider: "صنعت شمال",
        city: "ساری",
        picture: "./avator.png",
        visible:true
    },
    {
        id: 3,
        firstName: "جواد",
        lastName: "زارع",
        phone: "09177043608",
        provider: "پتروشیمی خوزستان",
        city: "خوزستان",
        picture: "./avator.png",
        visible:true
    },
    {
        id: 4,
        firstName: "محمد",
        lastName: "شبرنگ",
        phone: "09177043608",
        provider: " خوزستان",
        city: "خوزستان",
        picture: "./avator.png",
        visible:true
    },
]);
