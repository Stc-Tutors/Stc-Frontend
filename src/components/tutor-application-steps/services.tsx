"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GetServicesAction } from "@/server/service-catalog";
import { IService, ServiceCatalogStatus } from "@/types/service-catalog";
import { useTutorApplication } from "@/contexts/tutor-application-context";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: { servicesOffered: string[] }) => void;
  errors: Record<string, string>;
}

// Step 1 of 2 for account creation - picked here, submitted together with
// personal-information.tsx's fields in one StartTutorApplicationAction call
// (see TutorApplicationContext.submitStep1). Drives which "What You Can
// Teach" sub-sections (teaching-details.tsx) are shown later.
export default function ServicesStep({ onNext, errors }: StepProps) {
  const { draft } = useTutorApplication();
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [servicesOffered, setServicesOffered] = useState<string[]>(draft.step1.servicesOffered || []);

  useEffect(() => {
    GetServicesAction(ServiceCatalogStatus.ACTIVE).then(([res]) => {
      setServices(res?.data ?? []);
      setIsLoading(false);
    });
  }, []);

  const toggleService = (serviceName: string) => {
    setServicesOffered((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};
      if (servicesOffered.length === 0) {
        stepErrors.servicesOffered = "Please select at least one service you can teach";
      }
      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, { servicesOffered });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [servicesOffered, onNext]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>What would you like to teach?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-sm text-gray-500">Loading services...</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center space-x-2 text-sm border rounded-md p-3 cursor-pointer hover:bg-gray-50"
              >
                <Checkbox
                  checked={servicesOffered.includes(service.serviceName)}
                  onCheckedChange={() => toggleService(service.serviceName)}
                />
                <span>{service.serviceName}</span>
              </label>
            ))}
          </div>
          {errors.servicesOffered && <p className="text-red-600 text-sm">{errors.servicesOffered}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
