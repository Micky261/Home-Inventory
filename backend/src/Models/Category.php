<?php

namespace App\Models;

class Category
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getAll()
    {
        $stmt = $this->db->query('SELECT * FROM categories ORDER BY name');
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('SELECT * FROM categories WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function getByName($name)
    {
        $stmt = $this->db->prepare('SELECT * FROM categories WHERE name = :name');
        $stmt->execute([':name' => $name]);
        return $stmt->fetch();
    }

    public function create($name)
    {
        // Check if category already exists
        $existing = $this->getByName($name);
        if ($existing) {
            return $existing['id'];
        }

        $stmt = $this->db->prepare('INSERT INTO categories (name) VALUES (:name)');
        $result = $stmt->execute([':name' => $name]);

        return $result ? $this->db->lastInsertId() : false;
    }

    public function update($id, $name)
    {
        $stmt = $this->db->prepare('UPDATE categories SET name = :name WHERE id = :id');
        return $stmt->execute([':id' => $id, ':name' => $name]);
    }

    public function delete($id)
    {
        // Check if category is in use
        $stmt = $this->db->prepare('SELECT COUNT(*) as count FROM items WHERE kategorie_id = :id');
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        if ($result['count'] > 0) {
            return false; // Cannot delete category in use
        }

        $stmt = $this->db->prepare('DELETE FROM categories WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}
