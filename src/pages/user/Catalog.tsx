import { useSearchParams } from "react-router-dom";
import CatalogSection from "../../components/CatalogSection/CatalogSection";

export const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  return <CatalogSection search={search} />;
};
