import React from "react";

import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";

export const SidebarData = [
  {
    section: "La cave",
    items: [
      {
        title: "Mes caves",
        path: "/cave",
        icon: <AiIcons.AiFillHome />,
        cName: "nav-text"
      },
      {
        title: "Favoris",
        path: "/favoris",
        icon: <FaIcons.FaHeart />,
        cName: "nav-text"
      }
    ]
  },
  {
    section: "Informations",
    items: [
      {
        title: "Rechercher un met",
        path: "/mets-vins",
        icon: <FaIcons.FaWineGlassAlt />,
        cName: "nav-text"
      },
      {
        title: "Rechercher un vin",
        path: "/vins-mets",
        icon: <FaIcons.FaWineGlassAlt />,
        cName: "nav-text"
      },
      {
        title: "Dictionnaire",
        path: "/dictionnaire",
        icon: <FaIcons.FaBook />,
        cName: "nav-text"
      },
      {
        title: "Mes recettes",
        path: "/mes-recettes",
        icon: <IoIcons.IoMdRestaurant />,
        cName: "nav-text"
      },
      {
        title: "Sommelier",
        path: "/sommelier",
        icon: <IoIcons.IoMdRestaurant />,
        cName: "nav-text"
      },
      {
        title: "Répartition par pays",
        path: "/repartition-pays",
        icon: <IoIcons.IoMdMap />,
        cName: "nav-text"
      },
      {
        title: "Millésimes",
        path: "/millesimes",
        icon: <IoIcons.IoMdHelpCircle />,
        cName: "nav-text"
      },
      {
        title: "Cépages",
        path: "/cepages",
        icon: <IoIcons.IoMdLeaf />,
        cName: "nav-text"
      }
    ]
  }
];
