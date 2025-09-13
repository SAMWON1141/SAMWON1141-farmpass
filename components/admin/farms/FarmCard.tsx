import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Farm, FarmMember } from "@/lib/types/common";
import {
  FarmCardHeader,
  FarmCardActions,
  FarmCardDetails,
  FarmCardPreview,
} from "./components";

interface FarmCardProps {
  farm: Farm;
  index: number;
  isOwner: boolean;
  onEdit: (farm: Farm) => void;
  onDelete: (farmId: string) => void;
  membersData?: Array<
    FarmMember & {
      profiles: {
        name: string;
      };
    }
  >;
}

export const FarmCard = React.memo(function FarmCard({
  farm,
  index,
  isOwner,
  onEdit,
  onDelete,
  membersData,
}: FarmCardProps) {
  return (
    <motion.div
      key={farm.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="min-h-[400px] flex flex-col">
        <CardHeader className="space-y-3 pb-3 flex-shrink-0">
          <FarmCardHeader farm={farm} isOwner={isOwner} />
          <FarmCardActions
            farm={farm}
            isOwner={isOwner}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </CardHeader>
        <CardContent>
          <FarmCardDetails farm={farm} />
          <FarmCardPreview farmId={farm.id} membersData={membersData} />
        </CardContent>
      </Card>
    </motion.div>
  );
});
