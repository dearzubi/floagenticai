import { FC } from "react";
import { Card, CardBody } from "@heroui/react";

const LoadingCardSkeleton: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-64">
          <CardBody className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-default-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-default-200 rounded w-3/4"></div>
                  <div className="h-3 bg-default-200 rounded w-1/2"></div>
                  <div className="h-6 bg-default-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-default-200 rounded"></div>
                <div className="h-3 bg-default-200 rounded w-5/6"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-default-200 rounded w-16"></div>
                <div className="h-6 bg-default-200 rounded w-20"></div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default LoadingCardSkeleton;
