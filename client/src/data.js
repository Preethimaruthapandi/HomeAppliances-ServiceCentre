
import {
  FaFireExtinguisher,
  FaPumpSoap,
  FaShower,
  FaUmbrellaBeach,
  FaKey,
} from "react-icons/fa";
import { FaHouseUser, FaPeopleRoof, FaKitchenSet } from "react-icons/fa6";
import {
  BiSolidWasher,
  BiSolidDryer,
  BiSolidFirstAid,
  BiWifi,
  BiSolidFridge,
} from "react-icons/bi";
import { BsSnow, BsFillDoorOpenFill, BsPersonWorkspace } from "react-icons/bs";

import {  MdMicrowave, MdBalcony, MdYard, MdPets } from "react-icons/md";
import {
  PiBathtubFill,
  PiCoatHangerFill,
  PiTelevisionFill,
} from "react-icons/pi";

import {
  GiHeatHaze,
  GiCctvCamera,
  GiBarbecue,
  GiToaster,
  GiCampfire,
} from "react-icons/gi";
import { AiFillCar } from "react-icons/ai";


/*new*/

import { 
  FaBlender, 
  FaTools
} from "react-icons/fa";
import { 
  MdOutlineSoupKitchen, 
  MdOutlineKitchen,
  MdRiceBowl 
} from "react-icons/md";
import { 
  GiCookingPot, 
  GiElectric
} from "react-icons/gi";
import { 
  TbIroning3,
  TbPlug,
} from "react-icons/tb";


export const categories = [
  {
    label: "All",
    icon: <FaTools />,
  },
  {
    label: "Pressure Cookers",
    icon: <MdOutlineSoupKitchen />,
    img: "assets/pressure_cooker_cat.png",
    description: "Fast and efficient cooking with Prestige pressure cookers!",
    cost: 1200,
  },
  {
    label: "Cookware",
    icon: <GiCookingPot />,
    img: "assets/cookware_cat.png",
    description: "Premium-quality cookware for every cooking need!",
    cost: 1500,
  },
  {
    label: "Kitchen Appliances",
    icon: <MdOutlineKitchen />,
    img: "assets/kitchenApp_cat.png",
    description: "Reliable and modern kitchen appliances for home!",
    cost: 1800,
  },
  {
    label: "Cooktops",
    icon: <GiElectric />,
    img: "assets/cooktops_cat.png",
    description: "Sleek and modern cooktops for perfect cooking experiences!",
    cost: 2000,
  },
  {
    label: "Rice Cookers",
    icon: <MdRiceBowl />,
    img: "assets/rice_cooker_cat.png",
    description: "Fluffy, perfectly cooked rice every time!",
    cost: 1100,
  },
  {
    label: "Food Preparation Appliances",
    icon: <FaBlender />,
    img: "assets/blender_cat.png",
    description: "Choppers, mixers, and grinders for seamless preparation!",
    cost: 1300,
  },
  {
    label: "Small Appliances",
    icon: <TbPlug />,
    img: "assets/small_appliances_cat.png",
    description: "Essential tools like toasters, kettles, and more!",
    cost: 1400,
  },
  {
    label: "Home Appliances",
    icon: <TbIroning3 />,
    img: "assets/home_appliances_cat.png",
    description: "Irons and other household essentials for everyday convenience!",
    cost: 1600,
  },
];



export const types = [
  {
    name: "An entire place",
    description: "Guests have the whole place to themselves",
    icon: <FaHouseUser />,
  },
  {
    name: "Room(s)",
    description:
      "Guests have their own room in a house, plus access to shared places",
    icon: <BsFillDoorOpenFill />,
  },
  {
    name: "A Shared Room",
    description:
      "Guests sleep in a room or common area that maybe shared with you or others",
    icon: <FaPeopleRoof />,
  },
];

export const facilities = [
  {
    name: "Bath tub",
    icon: <PiBathtubFill />,
  },
  {
    name: "Personal care products",
    icon: <FaPumpSoap />,
  },
  {
    name: "Outdoor shower",
    icon: <FaShower />,
  },
  {
    name: "Washer",
    icon: <BiSolidWasher />,
  },
  {
    name: "Dryer",
    icon: <BiSolidDryer />,
  },
  {
    name: "Hangers",
    icon: <PiCoatHangerFill />,
  },
  {
    name: "Iron",
    icon: <TbIroning3 />,
  },
  {
    name: "TV",
    icon: <PiTelevisionFill />,
  },
  {
    name: "Dedicated workspace",
    icon: <BsPersonWorkspace />
  },
  {
    name: "Air Conditioning",
    icon: <BsSnow />,
  },
  {
    name: "Heating",
    icon: <GiHeatHaze />,
  },
  {
    name: "Security cameras",
    icon: <GiCctvCamera />,
  },
  {
    name: "Fire extinguisher",
    icon: <FaFireExtinguisher />,
  },
  {
    name: "First Aid",
    icon: <BiSolidFirstAid />,
  },
  {
    name: "Wifi",
    icon: <BiWifi />,
  },
  {
    name: "Cooking set",
    icon: <FaKitchenSet />,
  },
  {
    name: "Refrigerator",
    icon: <BiSolidFridge />,
  },
  {
    name: "Microwave",
    icon: <MdMicrowave />,
  },
  {
    name: "Stove",
    icon: <GiToaster />,
  },
  {
    name: "Barbecue grill",
    icon: <GiBarbecue />,
  },
  {
    name: "Outdoor dining area",
    icon: <FaUmbrellaBeach />,
  },
  {
    name: "Private patio or Balcony",
    icon: <MdBalcony />,
  },
  {
    name: "Camp fire",
    icon: <GiCampfire />,
  },
  {
    name: "Garden",
    icon: <MdYard />,
  },
  {
    name: "Free parking",
    icon: <AiFillCar />,
  },
  {
    name: "Self check-in",
    icon: <FaKey />
  },
  {
    name: " Pet allowed",
    icon: <MdPets />
  }
];