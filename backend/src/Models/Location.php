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
        $stmt = $this->db->query('SELECT * FROM locations ORDER BY path, name');
        return $stmt->fetchAll();
    }

    public function getTree()
    {
        $locations = $this->getAll();
        return $this->buildTree($locations);
    }

    private function buildTree($locations, $parentId = null)
    {
        $branch = [];
        foreach ($locations as $location) {
            if ($location['parent_id'] == $parentId) {
                $children = $this->buildTree($locations, $location['id']);
                if ($children) {
                    $location['children'] = $children;
                }
                $branch[] = $location;
            }
        }
        return $branch;
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('SELECT * FROM locations WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function create($name, $parentId = null)
    {
        // Calculate path
        $path = $name;
        if ($parentId) {
            $parent = $this->getById($parentId);
            if ($parent) {
                $path = ($parent['path'] ? $parent['path'] . ' > ' : '') . $name;
            }
        }

        $stmt = $this->db->prepare('INSERT INTO locations (name, parent_id, path) VALUES (:name, :parent_id, :path)');
        $result = $stmt->execute([
            ':name' => $name,
            ':parent_id' => $parentId,
            ':path' => $path
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    public function update($id, $name, $parentId = null)
    {
        // Calculate new path
        $path = $name;
        if ($parentId) {
            $parent = $this->getById($parentId);
            if ($parent) {
                $path = ($parent['path'] ? $parent['path'] . ' > ' : '') . $name;
            }
        }

        $stmt = $this->db->prepare('UPDATE locations SET name = :name, parent_id = :parent_id, path = :path WHERE id = :id');
        $result = $stmt->execute([
            ':id' => $id,
            ':name' => $name,
            ':parent_id' => $parentId,
            ':path' => $path
        ]);

        // Update paths of all children
        if ($result) {
            $this->updateChildrenPaths($id);
        }

        return $result;
    }

    private function updateChildrenPaths($parentId)
    {
        $stmt = $this->db->prepare('SELECT * FROM locations WHERE parent_id = :parent_id');
        $stmt->execute([':parent_id' => $parentId]);
        $children = $stmt->fetchAll();

        $parent = $this->getById($parentId);

        foreach ($children as $child) {
            $newPath = ($parent['path'] ? $parent['path'] . ' > ' : '') . $child['name'];
            $updateStmt = $this->db->prepare('UPDATE locations SET path = :path WHERE id = :id');
            $updateStmt->execute([':path' => $newPath, ':id' => $child['id']]);

            // Recursively update grandchildren
            $this->updateChildrenPaths($child['id']);
        }
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

        // Check if location has children
        $stmt = $this->db->prepare('SELECT COUNT(*) as count FROM locations WHERE parent_id = :id');
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        if ($result['count'] > 0) {
            return false; // Cannot delete location with children
        }

        $stmt = $this->db->prepare('DELETE FROM locations WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }

    public function getFullPath($id)
    {
        $location = $this->getById($id);
        return $location ? $location['path'] : null;
    }
}
