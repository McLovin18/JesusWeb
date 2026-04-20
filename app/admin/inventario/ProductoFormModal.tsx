"use client";
import React from "react";
import ProductoForm from "./ProductoForm";

interface ProductoFormModalProps {
  show: boolean;
  onClose: () => void;
  initialData?: any;
  onSave?: (data: any) => void;
}


