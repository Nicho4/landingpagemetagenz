import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MetaGenz Bukit Carmel",
    short_name: "MetaGenz",

    description:
      "Website resmi komunitas youth Gereja GBT Bukit Carmel.",

    start_url: "/",

    display: "standalone",

    background_color: "#FDFBF7",

    theme_color: "#D97757",

    icons: [
      {
        src: "/favicon.ico",

        sizes: "any",

        type: "image/x-icon",
      },
    ],
  };
}