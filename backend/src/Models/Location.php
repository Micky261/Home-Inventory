<?php

namespace App\Models;

class Location
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getAll()
    {
        $stmt = $this->db->query('SELECT * FROM locations ORDER BY name');
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('SELECT * FROM locations WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function getByName($name)
    {
        $stmt = $this->db->prepare('SELECT * FROM locations WHERE name = :name');
        $stmt->execute([':name' => $name]);
        return $stmt->fetch();
    }

    public function create($name)
    {
        // Check if location already exists
        $existing = $this->getByName($name);
        if ($existing) {
            return $existing['id'];
        }

        $stmt = $this->db->prepare('INSERT INTO locations (name) VALUES (:name)');
        $result = $stmt->execute([':name' => $name]);

        return $result ? $this->db->lastInsertId() : false;
    }

    public function delete($id)
    {
        // Check if location is in use
        $stmt = $this->db->prepare('SELECT COUNT(*) as count FROM items WHERE ort_id = :id');
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        if ($result['count'] > 0) {
            return false; // Cannot delete location in use
        }

        $stmt = $this->db->prepare('DELETE FROM locations WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}
