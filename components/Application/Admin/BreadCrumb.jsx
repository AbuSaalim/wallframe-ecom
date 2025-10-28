import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BreadCrumb = ({ breadcrumbData }) => {
  return (
    <Breadcrumb className="mb-5">
      <BreadcrumbList>
        {breadcrumbData.length > 0 &&
          breadcrumbData.map((data, index) => {
            const isLast = index === breadcrumbData.length - 1;
            
            return (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{data.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={data.href}>
                      {data.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumb;
