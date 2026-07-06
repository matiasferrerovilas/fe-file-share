import type { FileSystemNode } from "../../models/FileSystemNode";

export const MOCK_FILE_SYSTEM_TREE: FileSystemNode[] = [
  {
    id: "personal",
    name: "Personal",
    type: "FOLDER",
    children: [
      {
        id: "fotos",
        name: "fotos",
        type: "FOLDER",
        children: [
          {
            id: "foto1",
            name: "foto1.jpg",
            type: "FILE",
            size: 2_453_000,
            contentType: "image/jpeg",
            createdAt: "2026-06-01T10:00:00Z",
            children: [],
          },
          {
            id: "foto2",
            name: "foto2.jpg",
            type: "FILE",
            size: 3_112_000,
            contentType: "image/jpeg",
            createdAt: "2026-06-02T11:30:00Z",
            children: [],
          },
          {
            id: "foto3",
            name: "foto3.jpg",
            type: "FILE",
            size: 1_887_000,
            contentType: "image/jpeg",
            createdAt: "2026-06-03T09:15:00Z",
            children: [],
          },
        ],
      },
      {
        id: "certificados",
        name: "certificados",
        type: "FOLDER",
        children: [
          {
            id: "certificado1",
            name: "certificado1.pdf",
            type: "FILE",
            size: 452_000,
            contentType: "application/pdf",
            createdAt: "2026-05-10T09:00:00Z",
            children: [],
          },
          {
            id: "certificado2",
            name: "certificado2.pdf",
            type: "FILE",
            size: 381_000,
            contentType: "application/pdf",
            createdAt: "2026-05-11T14:20:00Z",
            children: [],
          },
          {
            id: "certificado3",
            name: "certificado3.pdf",
            type: "FILE",
            size: 512_000,
            contentType: "application/pdf",
            createdAt: "2026-05-12T16:45:00Z",
            children: [],
          },
        ],
      },
    ],
  },
];
