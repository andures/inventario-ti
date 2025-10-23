import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading, Text, Image } from "@chakra-ui/react";
import { inventoryService } from "../../services/localRepo";
import type { InventoryItem } from "../../types";

export function UploadImage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    // Cargar información del item
    if (itemId) {
      inventoryService.list().then((items) => {
        const item = items.find(
          (i: InventoryItem & { _id?: string }) =>
            i._id === itemId || i.id === itemId
        );
        if (item) {
          setItemName(item.nombre);
        }
      });
    }
  }, [itemId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen");
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!preview || !itemId) return;

    try {
      setUploading(true);
      await inventoryService.update(itemId, { imagen: preview });
      alert("¡Imagen subida exitosamente!");
      setPreview(null);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Box
      minH="100vh"
      bg="gray.900"
      color="white"
      p={6}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box maxW="500px" w="100%">
        <Heading size="lg" mb={2} textAlign="center" color="purple.400">
          Subir Imagen
        </Heading>

        {itemName && (
          <Text mb={6} textAlign="center" color="gray.400" fontSize="lg">
            {itemName}
          </Text>
        )}

        <Box
          border="2px dashed"
          borderColor="gray.700"
          borderRadius="12px"
          p={8}
          textAlign="center"
          bg="gray.800"
          mb={4}
        >
          {preview ? (
            <Box>
              <Image
                src={preview}
                alt="Preview"
                maxH="300px"
                mx="auto"
                borderRadius="8px"
                mb={4}
              />
              <Button
                onClick={() => setPreview(null)}
                variant="outline"
                size="sm"
                colorScheme="red"
              >
                Cambiar imagen
              </Button>
            </Box>
          ) : (
            <Box>
              <Text mb={4} color="gray.400">
                Selecciona una imagen del dispositivo
              </Text>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{
                  display: "block",
                  margin: "0 auto",
                  padding: "10px",
                  backgroundColor: "#374151",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                }}
              />
            </Box>
          )}
        </Box>

        {preview && (
          <Button
            onClick={handleUpload}
            w="100%"
            bg="purple.600"
            color="white"
            _hover={{ bg: "purple.500" }}
            size="lg"
            disabled={uploading}
          >
            {uploading ? "Subiendo..." : "Subir Imagen"}
          </Button>
        )}

        <Button
          onClick={() => navigate("/")}
          w="100%"
          mt={4}
          variant="outline"
          borderColor="gray.700"
          color="gray.300"
        >
          Volver al sistema
        </Button>
      </Box>
    </Box>
  );
}
